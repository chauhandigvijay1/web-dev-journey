const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    entityType: {
      type: String,
      enum: ['task', 'note', 'message', 'workspace', 'member', 'billing', 'file', 'meeting'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
)

activityLogSchema.index({ workspace: 1, createdAt: -1 })

module.exports = mongoose.model('ActivityLog', activityLogSchema)
