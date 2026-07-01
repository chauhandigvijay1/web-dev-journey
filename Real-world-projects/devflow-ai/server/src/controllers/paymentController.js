const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const env = require("../config/env");

const getRazorpayClient = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

const PLAN_LIMIT = 20;
const DEFAULT_MONTHLY_PRICE = 29900;

const COUPONS = {
  FREETRIAL: { code: "FREETRIAL", amount: 100, durationDays: 7 },
  OFF50: { code: "OFF50", amount: 14950, durationDays: 30 },
};

const ensureSubscriptionShape = (user) => {
  if (!user.subscription || typeof user.subscription !== "object") {
    const legacyPlan = user.subscription === "pro" ? "pro" : "free";
    user.subscription = {
      plan: legacyPlan,
      status: legacyPlan === "pro" ? "active" : "inactive",
      expiresAt: undefined,
      offerCode: "",
    };
  }
};

const ensureUsageShape = (user) => {
  if (!user.usage || typeof user.usage !== "object") {
    user.usage = { dailyCount: 0, lastReset: new Date() };
    return;
  }
  if (typeof user.usage.dailyCount !== "number") user.usage.dailyCount = 0;
  if (!user.usage.lastReset) user.usage.lastReset = new Date();
};

const resolveCoupon = (couponCode) => {
  const normalized = String(couponCode || "").trim().toUpperCase();
  if (env.ownerCoupon && normalized === env.ownerCoupon.toUpperCase()) {
    return {
      code: normalized,
      amount: 0,
      durationDays: env.ownerCouponDuration,
      isSecret: true,
    };
  }
  return COUPONS[normalized] || null;
};

// Create a Razorpay order for checkout.
const createOrder = asyncHandler(async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Payment gateway is not configured", 503);
  }

  const coupon = resolveCoupon(req.body?.couponCode);
  const amount = coupon?.amount !== undefined ? coupon.amount : DEFAULT_MONTHLY_PRICE;

  if (amount === 0) {
    const nonce = crypto.randomBytes(16).toString("hex");
    const user = await User.findById(req.user._id);
    if (user) {
      user.checkoutNonce = nonce;
      user.checkoutNonceExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
    }
    return res.json({
      success: true,
      data: {
        orderId: "free_checkout",
        nonce,
        amount: 0,
        currency: "INR",
        isFree: true,
      },
    });
  }

  const options = {
    amount,
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create(options);

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});

// Verify Razorpay payment signature and activate subscription.
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, nonce, couponCode } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Payment verification payload is incomplete", 400);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Duplicate payment prevention
  if (user.usedPaymentIds.includes(razorpay_payment_id)) {
    throw new AppError("This payment has already been processed", 400);
  }

  let verifiedCoupon = null;

  if (razorpay_order_id === "free_checkout") {
    // Nonce-based verification for free checkout
    if (!nonce || !user.checkoutNonce || user.checkoutNonce !== nonce) {
      throw new AppError("Invalid or expired free checkout session", 400);
    }
    if (!user.checkoutNonceExpires || new Date() > new Date(user.checkoutNonceExpires)) {
      user.checkoutNonce = null;
      user.checkoutNonceExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError("Free checkout session has expired", 400);
    }
    const coupon = resolveCoupon(couponCode);
    if (!coupon || coupon.amount !== 0) {
      throw new AppError("Invalid free checkout session", 400);
    }
    verifiedCoupon = coupon;
    // Consume the nonce
    user.checkoutNonce = null;
    user.checkoutNonceExpires = undefined;
  } else {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
    if (couponCode) {
      const coupon = resolveCoupon(couponCode);
      if (coupon && coupon.amount > 0) {
         verifiedCoupon = coupon;
      }
    }
  }

  ensureSubscriptionShape(user);
  ensureUsageShape(user);

  if (verifiedCoupon && !verifiedCoupon.isSecret) {
    if (user.usedCoupons.includes(verifiedCoupon.code)) {
      throw new AppError("This coupon has already been redeemed by this account.", 400);
    }
    user.usedCoupons.push(verifiedCoupon.code);
  }

  const durationDays = verifiedCoupon ? verifiedCoupon.durationDays : 30;

  user.subscription = {
    plan: "pro",
    status: "active",
    expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    offerCode: verifiedCoupon ? verifiedCoupon.code : "",
  };

  user.usedPaymentIds.push(razorpay_payment_id);

  await user.save();

  res.json({ success: true, message: "Payment successful" });
});

// Return current billing state and usage limits.
const getBillingStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  ensureSubscriptionShape(user);
  ensureUsageShape(user);

  const now = new Date();
  const expiresAt = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : null;
  if (user.subscription.plan === "pro" && expiresAt && expiresAt <= now) {
    user.subscription.plan = "free";
    user.subscription.status = "inactive";
    user.subscription.expiresAt = undefined;
  }

  const lastReset = new Date(user.usage.lastReset);
  if (now.toDateString() !== lastReset.toDateString()) {
    user.usage.dailyCount = 0;
    user.usage.lastReset = now;
  }

  await user.save({ validateBeforeSave: false });

  const isPro = user.subscription.plan === "pro";
  const limit = isPro ? 999 : PLAN_LIMIT;
  const usageCount = user.usage.dailyCount || 0;

  res.json({
    success: true,
    data: {
      plan: user.subscription.plan || "free",
      status: user.subscription.status || "inactive",
      expiresAt: user.subscription.expiresAt || null,
      usage: {
        dailyCount: usageCount,
        limit,
        remaining: isPro ? 999 : Math.max(0, limit - usageCount),
        lastReset: user.usage.lastReset,
      },
      pricing: {
        regularMonthly: DEFAULT_MONTHLY_PRICE,
        currency: "INR",
      },
      expiredOfferPrompt: {
        show: !isPro && Boolean(expiresAt && expiresAt <= now),
        message: "Your Pro access has expired. Upgrade to continue.",
      },
    },
  });
});

// Validate and apply supported coupon codes.
const applyCoupon = asyncHandler(async (req, res) => {
  const coupon = resolveCoupon(req.body?.couponCode);
  if (!coupon) {
    throw new AppError("Invalid coupon code", 400);
  }
  const user = await User.findById(req.user._id);
  if (!coupon.isSecret && user?.usedCoupons?.includes(coupon.code)) {
    throw new AppError("This coupon has already been redeemed by this account.", 400);
  }
  
  res.json({ success: true, data: coupon });
});

// Cancel active subscription immediately.
const cancelSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);

  ensureSubscriptionShape(user);
  
  if (user.subscription.plan !== "pro") {
    throw new AppError("You do not have an active Pro subscription to cancel.", 400);
  }

  user.subscription.plan = "free";
  user.subscription.status = "canceled";
  user.subscription.expiresAt = undefined;
  user.subscription.offerCode = "";
  
  // Immediately enforce free limits
  if (user.usage && user.usage.dailyCount > PLAN_LIMIT) {
     user.usage.dailyCount = PLAN_LIMIT;
  }

  await user.save();

  res.json({ success: true, message: "Subscription cancelled successfully." });
});

module.exports = {
  createOrder,
  verifyPayment,
  getBillingStatus,
  applyCoupon,
  cancelSubscription,
};