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

const noteSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
      default: 'Untitled Note',
    },
    slug: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    plainText: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    folder: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedToken: {
      type: String,
      default: null,
      index: true,
    },
    lastEditedAt: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
)

noteSchema.index({ title: 'text', plainText: 'text' })
noteSchema.index({ workspace: 1, isArchived: 1, isPinned: -1, lastEditedAt: -1 })

module.exports = mongoose.model('Note', noteSchema)
