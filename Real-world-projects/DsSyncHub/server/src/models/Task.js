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

const taskSchema = new mongoose.Schema(
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
      minlength: 2,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    labels: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

taskSchema.index({ workspace: 1, status: 1, order: 1 })
taskSchema.index({ workspace: 1, dueDate: 1 })

module.exports = mongoose.model('Task', taskSchema)
