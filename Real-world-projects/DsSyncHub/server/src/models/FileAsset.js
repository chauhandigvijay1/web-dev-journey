const mongoose = require('mongoose')

const fileAssetSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    storagePath: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ['local'],
      default: 'local',
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ['chat', 'task', 'note', 'general'],
      default: 'general',
      index: true,
    },
    linkedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
)

fileAssetSchema.index({ workspace: 1, createdAt: -1 })
fileAssetSchema.index({ workspace: 1, source: 1, createdAt: -1 })

module.exports = mongoose.model('FileAsset', fileAssetSchema)
