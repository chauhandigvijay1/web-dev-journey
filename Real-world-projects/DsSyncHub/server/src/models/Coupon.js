const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'free_trial', 'owner'],
      required: true,
    },
    value: {
      type: Number,
      default: 0,
    },
    durationMonths: {
      type: Number,
      default: 0,
    },
    maxUsesPerUser: {
      type: Number,
      default: 1,
    },
    maxTotalUses: {
      type: Number,
      default: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    applicablePlans: {
      type: [String],
      default: ['pro_monthly', 'pro_yearly'],
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
)

couponSchema.index({ code: 1 })

module.exports = mongoose.model('Coupon', couponSchema)
