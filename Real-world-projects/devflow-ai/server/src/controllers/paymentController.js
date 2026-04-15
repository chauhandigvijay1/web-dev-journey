const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const AppError = require("../utils/AppError");

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
  return COUPONS[normalized] || null;
};

// Create a Razorpay order for checkout.
const createOrder = asyncHandler(async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Payment gateway is not configured", 503);
  }

  const coupon = resolveCoupon(req.body?.couponCode);
  const amount = coupon?.amount || DEFAULT_MONTHLY_PRICE;

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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Payment verification payload is incomplete", 400);
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  ensureSubscriptionShape(user);
  ensureUsageShape(user);

  user.subscription = {
    plan: "pro",
    status: "active",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    offerCode: "",
  };

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
  res.json({ success: true, data: coupon });
});

module.exports = {
  createOrder,
  verifyPayment,
  getBillingStatus,
  applyCoupon,
};