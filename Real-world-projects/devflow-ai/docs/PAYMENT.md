# DevFlow AI — Payment & Billing System

## Overview

DevFlow AI uses **Razorpay** as its payment gateway for Pro subscription upgrades. The billing system supports one-time payments, coupon-based discounts, free trials, and immediate subscription cancellation.

## Pricing

| Plan | Price | AI Prompts/Day | Features |
|---|---|---|---|
| Free | ₹0 | 20 | Basic AI chat, Markdown, code highlighting |
| Pro | ₹299/month (29,900 paise) | Unlimited | All features + priority support |

## Payment Flow

```
┌──────────┐                ┌──────────┐               ┌──────────┐
│  Client  │                │  Server  │               │ Razorpay │
└────┬─────┘                └────┬─────┘               └────┬─────┘
     │                          │                          │
     │ POST /payments/create-order                          │
     │ { couponCode?: "OFF50" }│                          │
     ├─────────────────────────>│                          │
     │                          │ Resolve coupon amount   │
     │                          │ or use default 29,900 paise  │
     │                          │                          │
     │                          │ POST /orders            │
     │                          ├─────────────────────────>│
     │                          │ { order_id, amount }     │
     │                          │<─────────────────────────│
     │ { orderId, amount,       │                          │
     │   keyId, currency }      │                          │
     │<─────────────────────────│                          │
     │                          │                          │
     │ Open Razorpay Checkout   │                          │
     │ (client-side SDK)        │                          │
     │                          │                          │
     │ User completes payment──>│ Razorpay overlay         │
     │                          │                          │
     │ Receives payment_id,     │                          │
     │ razorpay_signature       │                          │
     │                          │                          │
     │ POST /payments/verify    │                          │
     │ { order_id, payment_id,  │                          │
     │   signature, couponCode }│                          │
     ├─────────────────────────>│                          │
     │                          │ HMAC SHA256 verify       │
     │                          │ Subscribe user           │
     │                          │                          │
     │ { success: true }        │                          │
     │<─────────────────────────│                          │
     │                          │                          │
     │ GET /payments/status     │                          │
     │ (refresh billing UI)     │                          │
     ├─────────────────────────>│                          │
     │ { plan, usage, ... }     │                          │
     │<─────────────────────────│                          │
```

## Coupon System

### Built-in Coupons

| Code | Discount | Duration | Type |
|---|---|---|---|
| `FREETRIAL` | 100% (29,900 paise off) | 7 days | Public |
| `OFF50` | 50% (14,950 paise off) | 30 days | Public |

### Owner/Secret Coupon

| Variable | Default | Description |
|---|---|---|
| `OWNER_COUPON` | `—` | Coupon code for 100% free Pro access (no hardcoded fallback) |
| `OWNER_COUPON_DURATION` | `30` | Subscription duration in days |

The owner coupon bypasses all payment flow. The `create-order` endpoint generates a one-time `nonce` (cryptographic random, stored with 5-minute expiry), and returns `{ isFree: true, orderId: "free_checkout", nonce }`. The `verify` endpoint validates the nonce before granting Pro access — preventing replay and forgery attacks.

### Coupon Validation Rules

- Coupons are **case-insensitive** during lookup but stored in uppercase
- Public coupons cannot be redeemed more than once per account (tracked via `user.usedCoupons[]`)
- Owner coupon can be used multiple times
- Coupons are resolved on the server using the `resolveCoupon()` utility

## Subscription States

| State | Description |
|---|---|
| `inactive` | Free tier, no subscription |
| `active` | Pro subscription active and within validity period |
| `expired` | Pro subscription has passed its `expiresAt` date (derived state — the actual stored state becomes `plan: "free"`, `status: "inactive"`) |
| `canceled` | User manually canceled Pro subscription |
| `past_due` | (Not implemented — reserved for future recurring billing) |
| `trialing` | (Not implemented — reserved for future free trial feature) |

### Auto-Downgrade

On every protected request (both `/api/ai/prompt` and `/api/payments/status`), the server checks if the Pro subscription has expired:

```javascript
if (plan === "pro" && expiresAt && expiresAt <= now) {
  plan = "free";
  status = "inactive";
  expiresAt = undefined;
}
```

This means there is no grace period — access is revoked immediately at expiry.

## Billing Status Response

`GET /api/payments/status` returns:

```json
{
  "plan": "free",
  "status": "inactive",
  "expiresAt": null,
  "usage": {
    "dailyCount": 5,
    "limit": 20,
    "remaining": 15,
    "lastReset": "2025-01-01T00:00:00.000Z"
  },
  "pricing": {
    "regularMonthly": 29900,
    "currency": "INR"
  },
  "expiredOfferPrompt": {
    "show": false,
    "message": "Your Pro access has expired. Upgrade to continue."
  }
}
```

## Subscription Cancellation

`POST /api/payments/cancel` immediately:
1. Sets subscription plan to `free`
2. Sets status to `canceled`
3. Clears `expiresAt` and `offerCode`
4. Caps usage daily count at the free tier limit (20) if it exceeds it

There is no prorated refund — cancellation is immediate and final.

## Usage Tracking

| Mechanism | Description |
|---|---|
| `user.usage.dailyCount` | Incremented after each successful AI prompt |
| `user.usage.lastReset` | UTC date of the last counter reset |
| Reset condition | UTC date change detected via `isSameUtcDate()` |

The limit check happens before the Groq API call to avoid unnecessary costs:

```javascript
if (plan === "free" && dailyCount >= 20) {
  throw new AppError("Daily limit reached. Upgrade to Pro.", 429);
}
```

## Client-Side Implementation

### Razorpay SDK Loading

The Razorpay checkout.js is loaded dynamically on the pricing and billing pages via a custom hook (not globally, to reduce page weight).

### Billing Page Features

- **Usage meter:** Visual progress bar showing daily usage against limit
- **Plan display:** Current plan with expiry date for Pro users
- **Coupon input:** Text field with validation feedback
- **Checkout button:** Triggers Razorpay payment modal
- **Cancel button:** For active Pro subscriptions
- **Expiry banner:** Prompts re-upgrade when Pro expires
- **45-second watchdog timer:** Cancels payment if Razorpay modal doesn't load within 45 seconds
- **15-second request timeout:** For all API calls

### Razorpay Options Object

```javascript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: "INR",
  name: "DevFlow AI",
  order_id: order.orderId,
  handler: async function (response) {
    // POST to /api/payments/verify
  },
  modal: {
    ondismiss: function () {
      // Handle modal close without payment
    },
  },
};
```

## Security

### Signature Verification

All Razorpay payments are verified server-side using HMAC-SHA256:

```javascript
const body = razorpay_order_id + "|" + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest("hex");

if (expectedSignature !== razorpay_signature) {
  return res.status(400).json({ success: false, message: "Invalid signature" });
}
```

### Key Management

- `RAZORPAY_KEY_ID` (public) — used by the client SDK to identify the merchant
- `RAZORPAY_KEY_SECRET` (private) — used server-side for order creation and signature verification
- The client must never have access to `RAZORPAY_KEY_SECRET`

## Current Limitations

- **No recurring billing:** Payments are one-time with a fixed duration. No automatic renewal.
- **No prorated refunds:** Cancellation is immediate with no partial refund.
- **No invoice generation:** Receipts are handled only through Razorpay's dashboard.
- **No webhook handling:** The server does not process Razorpay webhooks (payment failures, refunds, etc.).
- **No multi-currency support:** Currently INR only.
- **No trial period:** Pro access starts immediately after payment verification.
