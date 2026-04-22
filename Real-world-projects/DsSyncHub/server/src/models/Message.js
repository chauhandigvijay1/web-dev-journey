const mongoose = require('mongoose')

const attachmentSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
)

const messageSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      default: null,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    mentions: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    seenBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    reactions: {
      type: [
        {
          emoji: { type: String, required: true },
          users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
)

messageSchema.index({ workspace: 1, createdAt: -1 })
messageSchema.index({ workspace: 1, channel: 1, createdAt: -1 })
messageSchema.index({ sender: 1, createdAt: -1 })

module.exports = mongoose.model('Message', messageSchema)
