const mongoose = require('mongoose')

const meetingParticipantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const meetingSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Instant Sync',
      maxlength: 120,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'ended'],
      default: 'live',
      index: true,
    },
    participants: {
      type: [meetingParticipantSchema],
      default: [],
    },
  },
  { timestamps: true },
)

meetingSchema.index({ workspace: 1, status: 1, scheduledFor: 1, createdAt: -1 })

module.exports = mongoose.model('Meeting', meetingSchema)
