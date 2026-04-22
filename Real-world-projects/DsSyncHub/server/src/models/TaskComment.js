const mongoose = require('mongoose')

const taskCommentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    mentions: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  { timestamps: true },
)

taskCommentSchema.index({ task: 1, createdAt: 1 })

module.exports = mongoose.model('TaskComment', taskCommentSchema)
