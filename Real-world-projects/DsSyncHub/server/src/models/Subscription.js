const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro_monthly', 'pro_yearly'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'cancelled', 'expired', 'pending'],
      default: 'active',
    },
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'manual'],
      default: 'manual',
    },
    providerCustomerId: {
      type: String,
      default: '',
      trim: true,
    },
    providerSubscriptionId: {
      type: String,
      default: '',
      trim: true,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

subscriptionSchema.index({ workspace: 1, status: 1 })

module.exports = mongoose.model('Subscription', subscriptionSchema)
