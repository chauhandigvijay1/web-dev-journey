const mongoose = require('mongoose')
const crypto = require('crypto')
const Razorpay = require('razorpay')
const AiUsage = require('../models/AiUsage')
const BillingInvoice = require('../models/BillingInvoice')
const Coupon = require('../models/Coupon')
const CouponRedemption = require('../models/CouponRedemption')
const Membership = require('../models/Membership')
const Subscription = require('../models/Subscription')
const Workspace = require('../models/Workspace')
const { getPlanLimits } = require('../services/planLimits')
const { getStorageUsageSummary } = require('../services/storageService')

const getRazorpayClient = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim()
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
  if (!keyId || !keySecret) return null
  try {
    return new Razorpay({ key_id: keyId, key_secret: keySecret })
  } catch {
    return null
  }
}

const amountByPlan = {
  pro_monthly: 999,
  pro_yearly: 9999,
}

const ensureActiveMember = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active' })

const ensureAdminMember = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active', role: { $in: ['owner', 'admin'] } })

const toSubscription = (item) => ({
  id: item._id,
  user: item.user,
  workspace: item.workspace,
  plan: item.plan,
  status: item.status,
  provider: item.provider,
  currentPeriodStart: item.currentPeriodStart,
  currentPeriodEnd: item.currentPeriodEnd,
  cancelAtPeriodEnd: item.cancelAtPeriodEnd,
  couponCode: item.couponCode || null,
  couponType: item.couponType || null,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

const buildCouponSeedList = () => {
  const ownerCode = (process.env.OWNER_COUPON_CODE || '').trim()
  const coupons = [
    {
      code: 'MONTHLY50',
      type: 'percentage',
      value: 50,
      durationMonths: 3,
      applicablePlans: ['pro_monthly'],
      description: '50% off for 3 months on Pro Monthly plan',
    },
    {
      code: 'YEARLY50',
      type: 'percentage',
      value: 50,
      durationMonths: 3,
      applicablePlans: ['pro_yearly'],
      description: '50% off for 3 months on Pro Yearly plan',
    },
    {
      code: 'TRIAL30',
      type: 'free_trial',
      durationMonths: 1,
      applicablePlans: ['pro_monthly', 'pro_yearly'],
      description: '30-day free trial of Pro plan',
    },
  ]
  if (ownerCode) {
    coupons.push({
      code: ownerCode,
      type: 'owner',
      durationMonths: 12,
      applicablePlans: ['pro_monthly', 'pro_yearly'],
      description: 'Owner coupon — free Pro access for 1 year',
    })
  }
  return coupons
}

const seedCoupons = async () => {
  const existingCount = await Coupon.countDocuments()
  if (existingCount > 0) return
  const list = buildCouponSeedList()
  for (const c of list) {
    const expiresAt = c.type === 'owner' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    await Coupon.findOneAndUpdate(
      { code: c.code },
      { ...c, isActive: true, expiresAt, maxUsesPerUser: 1, maxTotalUses: 0, usedCount: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }
}

const getCurrentBilling = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspace query is required.' })
    const membership = await ensureActiveMember(req.user._id, workspaceId)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const workspace = await Workspace.findById(workspaceId).select('name plan')
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' })

    let subscription =
      (await Subscription.findOne({ workspace: workspaceId }).sort({ createdAt: -1 })) ||
      (await Subscription.create({
        workspace: workspaceId,
        user: req.user._id,
        plan: workspace.plan === 'pro' ? 'pro_monthly' : 'free',
        status: 'active',
        provider: 'manual',
      }))

    const today = new Date()
    if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < today && subscription.status === 'active' && subscription.provider !== 'manual') {
      subscription.status = 'expired'
      await subscription.save()
      if (workspace.plan !== 'free') {
        workspace.plan = 'free'
        await workspace.save()
      }
    }

    const activeRedemption = await CouponRedemption.findOne({ workspace: workspaceId, isActive: true }).populate('coupon').lean()

    const limits = await getPlanLimits(workspaceId)
    const membersUsed = await Membership.countDocuments({ workspace: workspaceId, status: 'active' })
    const storage = await getStorageUsageSummary(workspaceId)
    const dateKey = new Date().toISOString().slice(0, 10)
    const aiUsage = mongoose.Types.ObjectId.isValid(String(workspaceId))
      ? await AiUsage.aggregate([
          { $match: { workspace: new mongoose.Types.ObjectId(String(workspaceId)), dateKey } },
          { $group: { _id: '$workspace', total: { $sum: '$count' } } },
        ])
      : []

    return res.status(200).json({
      success: true,
      current: {
        subscription: toSubscription(subscription),
        limits,
        usage: {
          membersUsed,
          aiUsed: aiUsage[0]?.total || 0,
          storageUsedMb: storage.usedMb,
          storageLimitMb: storage.limitMb,
        },
        activeCoupon: activeRedemption
          ? {
              code: activeRedemption.code,
              type: activeRedemption.coupon?.type || activeRedemption.code,
              benefitExpiresAt: activeRedemption.benefitExpiresAt,
            }
          : null,
      },
    })
  } catch (error) {
    return next(error)
  }
}

const getBillingHistory = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspace query is required.' })
    const membership = await ensureAdminMember(req.user._id, workspaceId)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const invoices = await BillingInvoice.find({ workspace: workspaceId }).sort({ billedAt: -1 }).limit(50)
    return res.status(200).json({
      success: true,
      history: invoices.map((item) => ({
        id: item._id,
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        invoiceUrl: item.invoiceUrl,
        billedAt: item.billedAt,
      })),
    })
  } catch (error) {
    return next(error)
  }
}

const checkoutBilling = async (req, res, next) => {
  try {
    const { workspace, plan, coupon: couponCode } = req.body
    if (!workspace || !['pro_monthly', 'pro_yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'workspace and valid plan are required.' })
    }
    const membership = await ensureAdminMember(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const razorpay = getRazorpayClient()
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured.' })
    }

    let finalAmount = amountByPlan[plan]
    let appliedCouponId = null
    let appliedCouponDesc = null

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true })
      if (!coupon) {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' })
      }
      if (!coupon.applicablePlans.includes(plan)) {
        return res.status(400).json({ success: false, message: `This coupon is not valid for the ${plan} plan.` })
      }
      const existingRedemption = await CouponRedemption.findOne({ coupon: coupon._id, user: req.user._id, workspace })
      if (existingRedemption) {
        return res.status(400).json({ success: false, message: 'This coupon has already been used on this workspace.' })
      }
      if (coupon.maxTotalUses > 0 && coupon.usedCount >= coupon.maxTotalUses) {
        return res.status(400).json({ success: false, message: 'This coupon has reached its maximum usage limit.' })
      }
      if (coupon.type === 'percentage') {
        finalAmount = Math.round(finalAmount * (100 - coupon.value) / 100)
      }
      appliedCouponId = coupon._id
      appliedCouponDesc = { code: coupon.code, type: coupon.type, value: coupon.value, durationMonths: coupon.durationMonths }
    }

    const order = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency: process.env.BILLING_CURRENCY || 'INR',
      notes: {
        workspaceId: String(workspace),
        plan,
        userId: String(req.user._id),
        originalAmount: String(amountByPlan[plan] * 100),
        couponCode: couponCode || '',
        couponId: appliedCouponId ? String(appliedCouponId) : '',
      },
      receipt: `ds-${Date.now()}`,
    })

    return res.status(200).json({
      success: true,
      checkout: {
        provider: 'razorpay',
        keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        workspaceId: String(workspace),
        plan,
        appliedCoupon: appliedCouponDesc,
      },
    })
  } catch (error) {
    return next(error)
  }
}

const verifyBillingPayment = async (req, res, next) => {
  try {
    const { workspace, plan, razorpayOrderId, razorpayPaymentId, razorpaySignature, couponCode } = req.body
    if (!workspace || !['pro_monthly', 'pro_yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'workspace and valid plan are required.' })
    }
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification fields are required.' })
    }
    const membership = await ensureAdminMember(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Razorpay secret is not configured.' })
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' })
    }

    const now = new Date()
    const periodDays = plan === 'pro_yearly' ? 365 : 30

    let couponDurationMonths = 0
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true })
      if (coupon) {
        couponDurationMonths = coupon.durationMonths || 0
        coupon.usedCount = (coupon.usedCount || 0) + 1
        await coupon.save()
      }
    }

    const benefitEnd = couponDurationMonths > 1
      ? new Date(now.getTime() + couponDurationMonths * 30 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000)

    const subscriptionData = {
      user: req.user._id,
      workspace,
      plan,
      status: 'active',
      provider: 'razorpay',
      providerSubscriptionId: razorpayOrderId,
      currentPeriodStart: now,
      currentPeriodEnd: benefitEnd,
      cancelAtPeriodEnd: false,
    }
    if (couponCode) {
      subscriptionData.couponCode = couponCode.toUpperCase()
    }

    const subscription = await Subscription.findOneAndUpdate(
      { workspace },
      subscriptionData,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    await Workspace.findByIdAndUpdate(workspace, { plan: 'pro' })

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
      if (coupon) {
        await CouponRedemption.findOneAndUpdate(
          { coupon: coupon._id, user: req.user._id, workspace },
          {
            coupon: coupon._id,
            code: coupon.code,
            user: req.user._id,
            workspace,
            subscription: subscription._id,
            benefitExpiresAt: benefitEnd,
            isActive: true,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        )
      }
    }

    const invoiceId = new mongoose.Types.ObjectId()
    await BillingInvoice.create({
      _id: invoiceId,
      workspace,
      subscription: subscription._id,
      amount: amountByPlan[plan],
      currency: process.env.BILLING_CURRENCY || 'INR',
      status: 'paid',
      invoiceUrl: `/api/billing/invoice/${invoiceId}`,
    })

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      subscription: toSubscription(subscription),
    })
  } catch (error) {
    return next(error)
  }
}

const cancelBilling = async (req, res, next) => {
  try {
    const { workspace } = req.body
    if (!workspace) return res.status(400).json({ success: false, message: 'workspace is required.' })
    const membership = await ensureAdminMember(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const redemption = await CouponRedemption.findOne({ workspace, isActive: true }).populate('coupon')
    if (redemption && redemption.coupon && redemption.coupon.type === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Owner coupon subscriptions cannot be cancelled. Contact the developer to change the owner coupon code.',
      })
    }

    const subscription = await Subscription.findOne({ workspace })
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found.' })
    subscription.cancelAtPeriodEnd = true
    subscription.status = 'cancelled'
    await subscription.save()
    await Workspace.findByIdAndUpdate(workspace, { plan: 'free' })

    if (redemption) {
      redemption.isActive = false
      await redemption.save()
    }

    return res.status(200).json({ success: true, subscription: toSubscription(subscription) })
  } catch (error) {
    return next(error)
  }
}

const resumeBilling = async (req, res, next) => {
  try {
    const { workspace } = req.body
    if (!workspace) return res.status(400).json({ success: false, message: 'workspace is required.' })
    const membership = await ensureAdminMember(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const razorpay = getRazorpayClient()
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured for payment processing. Resume requires a new checkout.' })
    }

    const subscription = await Subscription.findOne({ workspace })
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found.' })

    if (subscription.couponCode && subscription.couponType !== 'owner') {
      const redemption = await CouponRedemption.findOne({ workspace, isActive: false }).sort({ createdAt: -1 })
      if (redemption) {
        redemption.isActive = true
        await redemption.save()
      }
    }

    subscription.cancelAtPeriodEnd = false
    subscription.status = 'active'
    if (subscription.plan !== 'free') {
      await Workspace.findByIdAndUpdate(workspace, { plan: 'pro' })
    }
    await subscription.save()

    return res.status(200).json({ success: true, subscription: toSubscription(subscription) })
  } catch (error) {
    return next(error)
  }
}

const billingConfig = async (_req, res) => {
  try {
    await seedCoupons()
    const razorpay = getRazorpayClient()
    const coupons = await Coupon.find({ isActive: true }).select('code type value durationMonths description applicablePlans').lean()

    const currency = process.env.BILLING_CURRENCY || 'INR'

    res.json({
      success: true,
      currency,
      razorpayConfigured: Boolean(razorpay),
      hasRazorpayKeyId: Boolean((process.env.RAZORPAY_KEY_ID || '').trim()),
      hasRazorpayKeySecret: Boolean((process.env.RAZORPAY_KEY_SECRET || '').trim()),
      hasOwnerCoupon: Boolean((process.env.OWNER_COUPON_CODE || '').trim()),
      provider: razorpay ? 'razorpay' : 'none',
      coupons: coupons
        .filter((c) => c.type !== 'owner')
        .map((c) => ({
          code: c.code,
          type: c.type,
          value: c.value,
          durationMonths: c.durationMonths,
          description: c.description,
          applicablePlans: c.applicablePlans,
        })),
    })
  } catch {
    res.json({
      success: true,
      currency: process.env.BILLING_CURRENCY || 'INR',
      razorpayConfigured: false,
      hasRazorpayKeyId: Boolean((process.env.RAZORPAY_KEY_ID || '').trim()),
      hasRazorpayKeySecret: Boolean((process.env.RAZORPAY_KEY_SECRET || '').trim()),
      hasOwnerCoupon: Boolean((process.env.OWNER_COUPON_CODE || '').trim()),
      provider: 'none',
      coupons: [],
    })
  }
}

const applyCoupon = async (req, res, next) => {
  try {
    const { workspace, code } = req.body
    if (!workspace || !code) {
      return res.status(400).json({ success: false, message: 'workspace and coupon code are required.' })
    }
    const membership = await ensureAdminMember(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Only workspace admins can apply coupons.' })

    await seedCoupons()

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code.' })
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' })
    }
    if (coupon.maxTotalUses > 0 && coupon.usedCount >= coupon.maxTotalUses) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its maximum usage limit.' })
    }

    const existingRedemption = await CouponRedemption.findOne({ coupon: coupon._id, user: req.user._id, workspace })
    if (existingRedemption) {
      if (coupon.type === 'owner') {
        const ownerCode = (process.env.OWNER_COUPON_CODE || '').trim().toUpperCase()
        if (ownerCode && coupon.code === ownerCode && existingRedemption.isActive) {
          return res.status(400).json({ success: false, message: 'This owner coupon is already applied to this workspace.' })
        }
        if (ownerCode && coupon.code === ownerCode && !existingRedemption.isActive) {
          existingRedemption.isActive = true
          await existingRedemption.save()
          const sub = await Subscription.findOneAndUpdate(
            { workspace },
            { status: 'active', cancelAtPeriodEnd: false },
            { new: true },
          )
          await Workspace.findByIdAndUpdate(workspace, { plan: 'pro' })
          return res.status(200).json({ success: true, message: 'Owner coupon reactivated. Workspace upgraded to Pro.', subscription: sub ? toSubscription(sub) : undefined })
        }
      }
      return res.status(400).json({ success: false, message: 'This coupon has already been used on this workspace.' })
    }

    const now = new Date()

    if (coupon.type === 'percentage') {
      let targetPlan = coupon.applicablePlans[0]
      if (targetPlan === 'pro_monthly' || targetPlan === 'pro_yearly') {
        targetPlan = req.body.plan || targetPlan
      }
      if (!coupon.applicablePlans.includes(targetPlan)) {
        targetPlan = coupon.applicablePlans[0]
      }

      return res.status(200).json({
        success: true,
        message: `Coupon "${coupon.code}" valid! ${coupon.value}% off for ${coupon.durationMonths} month(s) on the ${targetPlan} plan. Proceed with checkout to apply.`,
        requiresCheckout: true,
        discountedPlan: targetPlan,
      })
    }

    if (coupon.type === 'free_trial') {
      const benefitEnd = new Date(now.getTime() + (coupon.durationMonths || 1) * 30 * 24 * 60 * 60 * 1000)

      const subscription = await Subscription.findOneAndUpdate(
        { workspace },
        {
          user: req.user._id,
          workspace,
          plan: 'pro_monthly',
          status: 'active',
          provider: 'manual',
          currentPeriodStart: now,
          currentPeriodEnd: benefitEnd,
          cancelAtPeriodEnd: false,
          couponCode: coupon.code,
          couponType: coupon.type,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )

      await Workspace.findByIdAndUpdate(workspace, { plan: 'pro' })

      await CouponRedemption.create({
        coupon: coupon._id,
        code: coupon.code,
        user: req.user._id,
        workspace,
        subscription: subscription._id,
        benefitExpiresAt: benefitEnd,
        isActive: true,
      })

      coupon.usedCount = (coupon.usedCount || 0) + 1
      await coupon.save()

      return res.status(200).json({
        success: true,
        message: `Coupon "${coupon.code}" applied! Enjoy ${coupon.durationMonths} month(s) of Pro plan free.`,
        subscription: toSubscription(subscription),
      })
    }

    if (coupon.type === 'owner') {
      const ownerCode = (process.env.OWNER_COUPON_CODE || '').trim().toUpperCase()
      if (!ownerCode || coupon.code !== ownerCode) {
        return res.status(400).json({ success: false, message: 'Owner coupon is not currently active.' })
      }

      const benefitEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

      const subscription = await Subscription.findOneAndUpdate(
        { workspace },
        {
          user: req.user._id,
          workspace,
          plan: 'pro_monthly',
          status: 'active',
          provider: 'manual',
          currentPeriodStart: now,
          currentPeriodEnd: benefitEnd,
          cancelAtPeriodEnd: false,
          couponCode: coupon.code,
          couponType: coupon.type,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )

      await Workspace.findByIdAndUpdate(workspace, { plan: 'pro' })

      await CouponRedemption.create({
        coupon: coupon._id,
        code: coupon.code,
        user: req.user._id,
        workspace,
        subscription: subscription._id,
        benefitExpiresAt: benefitEnd,
        isActive: true,
      })

      coupon.usedCount = (coupon.usedCount || 0) + 1
      await coupon.save()

      return res.status(200).json({
        success: true,
        message: `Owner coupon applied! Pro plan active for 1 year.`,
        subscription: toSubscription(subscription),
      })
    }

    return res.status(400).json({ success: false, message: 'Unknown coupon type.' })
  } catch (error) {
    return next(error)
  }
}

const listCoupons = async (_req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true, type: { $ne: 'owner' } }).select('code type value durationMonths description applicablePlans').lean()
    return res.status(200).json({ success: true, coupons })
  } catch (error) {
    return next(error)
  }
}

const seedCouponsEndpoint = async (_req, res, next) => {
  try {
    const ownerCode = (process.env.OWNER_COUPON_CODE || '').trim()
    const list = buildCouponSeedList()
    const results = []
    for (const c of list) {
      const expiresAt = c.type === 'owner' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      const coupon = await Coupon.findOneAndUpdate(
        { code: c.code },
        { ...c, isActive: true, expiresAt, maxUsesPerUser: 1, maxTotalUses: 0 },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      const ownerMsg = c.type === 'owner' ? ` (env: ${ownerCode ? 'set' : 'not set'})` : ''
      results.push(`${coupon.code} (${coupon.type})${ownerMsg}`)
    }
    return res.status(200).json({ success: true, message: 'Coupons seeded.', coupons: results })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getCurrentBilling,
  getBillingHistory,
  billingConfig,
  checkoutBilling,
  verifyBillingPayment,
  cancelBilling,
  resumeBilling,
  applyCoupon,
  listCoupons,
  seedCouponsEndpoint,
}
