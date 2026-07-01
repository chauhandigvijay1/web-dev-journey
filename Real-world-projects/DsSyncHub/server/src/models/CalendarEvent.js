const mongoose = require('mongoose')

const calendarEventSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['event', 'task', 'reminder', 'meeting'],
      default: 'event',
    },
    linkedEntityId: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: '#8b5cf6',
    },
  },
  { timestamps: true },
)

calendarEventSchema.index({ workspace: 1, date: 1 })
calendarEventSchema.index({ workspace: 1, createdBy: 1 })

module.exports = mongoose.model('CalendarEvent', calendarEventSchema)
