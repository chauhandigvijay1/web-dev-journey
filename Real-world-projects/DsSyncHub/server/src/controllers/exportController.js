const AdmZip = require('adm-zip')
const Task = require('../models/Task')
const Note = require('../models/Note')
const Message = require('../models/Message')
const CalendarEvent = require('../models/CalendarEvent')
const FileAsset = require('../models/FileAsset')
const Membership = require('../models/Membership')
const Workspace = require('../models/Workspace')
const logger = require('../services/logger')

const exportWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.id

    const membership = await Membership.findOne({ user: req.user._id, workspace: workspaceId, status: 'active' })
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' })

    const [tasks, notes, messages, events, files] = await Promise.all([
      Task.find({ workspace: workspaceId }).lean(),
      Note.find({ workspace: workspaceId }).lean(),
      Message.find({ workspace: workspaceId }).lean(),
      CalendarEvent.find({ workspace: workspaceId }).lean(),
      FileAsset.find({ workspace: workspaceId }).lean(),
    ])

    const zip = new AdmZip()

    zip.addFile('workspace.json', Buffer.from(JSON.stringify({
      name: workspace.name,
      slug: workspace.slug,
      plan: workspace.plan,
      exportedAt: new Date().toISOString(),
    }, null, 2)))

    if (tasks.length) {
      zip.addFile('tasks.json', Buffer.from(JSON.stringify(tasks.map((t) => ({
        title: t.title, description: t.description, status: t.status, priority: t.priority,
        dueDate: t.dueDate, createdAt: t.createdAt, updatedAt: t.updatedAt,
      })), null, 2)))
    }

    if (notes.length) {
      zip.addFile('notes.json', Buffer.from(JSON.stringify(notes.map((n) => ({
        title: n.title, content: n.content, createdAt: n.createdAt, updatedAt: n.updatedAt,
      })), null, 2)))
    }

    if (messages.length) {
      zip.addFile('messages.json', Buffer.from(JSON.stringify(messages.map((m) => ({
        content: m.content, channel: m.channel, createdAt: m.createdAt,
      })), null, 2)))
    }

    if (events.length) {
      zip.addFile('calendar.json', Buffer.from(JSON.stringify(events.map((e) => ({
        title: e.title, description: e.description, date: e.date, endDate: e.endDate,
        allDay: e.allDay, color: e.color,
      })), null, 2)))
    }

    if (files.length) {
      zip.addFile('files.json', Buffer.from(JSON.stringify(files.map((f) => ({
        originalName: f.originalName, url: f.url, size: f.size, mimeType: f.mimeType,
        createdAt: f.createdAt,
      })), null, 2)))
    }

    const zipBuffer = zip.toBuffer()

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${workspace.slug}-export-${Date.now()}.zip"`)
    res.setHeader('Content-Length', zipBuffer.length)

    logger.info({ workspace: workspaceId, userId: req.user._id }, 'Workspace data exported')
    return res.send(zipBuffer)
  } catch (error) {
    return next(error)
  }
}

module.exports = { exportWorkspace }
