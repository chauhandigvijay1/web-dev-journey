const mongoose = require('mongoose')

const billingInvoiceSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    invoiceUrl: {
      type: String,
      default: '',
    },
    billedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
)

billingInvoiceSchema.index({ workspace: 1, billedAt: -1 })

module.exports = mongoose.model('BillingInvoice', billingInvoiceSchema)
