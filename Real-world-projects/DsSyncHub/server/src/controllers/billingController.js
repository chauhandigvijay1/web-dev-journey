const mongoose = require('mongoose')
const crypto = require('crypto')
const Razorpay = require('razorpay')
const AiUsage = require('../models/AiUsage')
const BillingInvoice = require('../models/BillingInvoice')
const Membership = require('../models/Membership')
const Subscription = require('../models/Subscription')
const Workspace = require('../models/Workspace')
const { getPlanLimits } = require('../services/planLimits')
const { getStorageUsageSummary } = require('../services/storageService')

const hasRazorpayConfig = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
const razorpayClient = hasRazorpayConfig
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null
const amountByPlan = {
  pro_monthly: 999,
  pro_yearly: 9999,
}

const ensureActiveMember = async (userId, workspaceId) =>
  Membership.findOne({
    user: userId,
    workspace: workspaceId,
    status: 'active',
  })

const ensureAdminMember = async (userId, workspaceId) =>
  Membership.findOne({
    user: userId,
    workspace: workspaceId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })

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
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

const getCurrentBilling = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspace query is required.' })
    const membership = await ensureActiveMember(req.user._id, workspaceId)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const workspace = await Workspace.findById(workspaceId).select('name plan')
    const subscription =
      (await Subscription.findOne({ workspace: workspaceId }).sort({ createdAt: -1 })) ||
      (await Subscription.create({
        workspace: workspaceId,
        user: req.user._id,
        plan: workspace?.plan === 'pro' ? 'pro_monthly' : 'free',
        status: 'active',
        provider: 'manual',
      }))

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
    const { workspace, plan } = req.body
    if (!workspace || !['pro_monthly', 'pro_yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'workspace and valid plan are required.' })
    }
    const membership = await ensureAdminMember(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    if (!razorpayClient) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured.',
      })
    }

    const order = await razorpayClient.orders.create({
      amount: amountByPlan[plan] * 100,
      currency: 'INR',
      notes: {
        workspaceId: String(workspace),
        plan,
        userId: String(req.user._id),
      },
      receipt: `ds-${Date.now()}`,
    })

    return res.status(200).json({
      success: true,
      checkout: {
        provider: 'razorpay',
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        workspaceId: String(workspace),
        plan,
      },
    })
  } catch (error) {
    return next(error)
  }
}

const verifyBillingPayment = async (req, res, next) => {
  try {
    const { workspace, plan, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
    if (!workspace || !['pro_monthly', 'pro_yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'workspace and valid plan are required.' })
    }
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification fields are required.' })
    }
    const membership = await ensureAdminMember(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Razorpay secret is not configured.' })
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' })
    }

    const now = new Date()
    const periodDays = plan === 'pro_yearly' ? 365 : 30
    const subscription = await Subscription.findOneAndUpdate(
      { workspace },
      {
        user: req.user._id,
        workspace,
        plan,
        status: 'active',
        provider: 'razorpay',
        providerSubscriptionId: razorpayOrderId,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    await Workspace.findByIdAndUpdate(workspace, { plan: 'pro' })
    await BillingInvoice.create({
      workspace,
      subscription: subscription._id,
      amount: amountByPlan[plan],
      currency: 'INR',
      status: 'paid',
      invoiceUrl: '',
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
    const subscription = await Subscription.findOne({ workspace })
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found.' })
    subscription.cancelAtPeriodEnd = true
    subscription.status = 'cancelled'
    await subscription.save()
    await Workspace.findByIdAndUpdate(workspace, { plan: 'free' })
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
    const subscription = await Subscription.findOne({ workspace })
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found.' })
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

module.exports = {
  getCurrentBilling,
  getBillingHistory,
  checkoutBilling,
  verifyBillingPayment,
  cancelBilling,
  resumeBilling,
}
