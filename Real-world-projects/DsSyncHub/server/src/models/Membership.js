const mongoose = require('mongoose')

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'pending'],
      default: 'active',
    },
  },
  { timestamps: true },
)

membershipSchema.index({ user: 1, workspace: 1 }, { unique: true })
membershipSchema.index({ workspace: 1, status: 1 })
membershipSchema.index({ user: 1, status: 1 })

module.exports = mongoose.model('Membership', membershipSchema)
