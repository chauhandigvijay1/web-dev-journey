const CalendarEvent = require('../models/CalendarEvent')
const Membership = require('../models/Membership')

const getMembership = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active' })

const canWrite = (role) => ['owner', 'admin', 'member'].includes(role)

const toEvent = (event) => ({
  id: event._id,
  workspace: event.workspace,
  createdBy: event.createdBy,
  title: event.title,
  description: event.description,
  date: event.date,
  endDate: event.endDate,
  allDay: event.allDay,
  source: event.source,
  linkedEntityId: event.linkedEntityId,
  color: event.color,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
})

const listEvents = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspace query is required.' })

    const membership = await getMembership(req.user._id, workspaceId)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const start = req.query.start ? new Date(req.query.start) : new Date(0)
    const end = req.query.end ? new Date(req.query.end) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    const events = await CalendarEvent.find({
      workspace: workspaceId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 })

    return res.status(200).json({ success: true, events: events.map(toEvent) })
  } catch (error) {
    return next(error)
  }
}

const createEvent = async (req, res, next) => {
  try {
    const { workspace, title, description, date, endDate, allDay, source, linkedEntityId, color } = req.body
    if (!workspace || !title || !date) {
      return res.status(400).json({ success: false, message: 'Workspace, title, and date are required.' })
    }

    const membership = await getMembership(req.user._id, workspace)
    if (!membership || !canWrite(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const event = await CalendarEvent.create({
      workspace,
      createdBy: req.user._id,
      title: title.trim(),
      description: description || '',
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      allDay: Boolean(allDay),
      source: ['event', 'task', 'reminder', 'meeting'].includes(source) ? source : 'event',
      linkedEntityId: linkedEntityId || null,
      color: color || '#8b5cf6',
    })

    const io = req.app.get('io')
    if (io) {
      const populatedEvent = await CalendarEvent.findById(event._id).populate('createdBy', 'fullName email avatarUrl')
      io.to(`workspace:${workspace}`).emit('calendar:created', toEvent(populatedEvent))
    }

    return res.status(201).json({ success: true, event: toEvent(event) })
  } catch (error) {
    return next(error)
  }
}

const updateEvent = async (req, res, next) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' })

    const membership = await getMembership(req.user._id, event.workspace)
    if (!membership || !canWrite(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const { title, description, date, endDate, allDay, color } = req.body
    if (typeof title === 'string') event.title = title.trim()
    if (typeof description === 'string') event.description = description
    if (date) event.date = new Date(date)
    if (endDate !== undefined) event.endDate = endDate ? new Date(endDate) : null
    if (typeof allDay === 'boolean') event.allDay = allDay
    if (typeof color === 'string') event.color = color

    await event.save()

    const io = req.app.get('io')
    if (io) {
      const populatedEvent = await CalendarEvent.findById(event._id).populate('createdBy', 'fullName email avatarUrl')
      io.to(`workspace:${event.workspace}`).emit('calendar:updated', toEvent(populatedEvent))
    }

    return res.status(200).json({ success: true, event: toEvent(event) })
  } catch (error) {
    return next(error)
  }
}

const deleteEvent = async (req, res, next) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' })

    const membership = await getMembership(req.user._id, event.workspace)
    if (!membership || !canWrite(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const workspaceId = event.workspace
    await event.deleteOne()

    const io = req.app.get('io')
    if (io) {
      io.to(`workspace:${workspaceId}`).emit('calendar:deleted', { eventId: event._id })
    }

    return res.status(200).json({ success: true, message: 'Event deleted.' })
  } catch (error) {
    return next(error)
  }
}

module.exports = { listEvents, createEvent, updateEvent, deleteEvent }
