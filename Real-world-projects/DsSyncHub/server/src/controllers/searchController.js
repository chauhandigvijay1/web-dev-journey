const Membership = require('../models/Membership')
const Message = require('../models/Message')
const Note = require('../models/Note')
const Task = require('../models/Task')
const FileAsset = require('../models/FileAsset')

const buildRegex = (q) => new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

const globalSearch = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    const q = String(req.query.q || '').trim().slice(0, 100)
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspace query is required.' })
    if (!q) {
      return res.status(200).json({
        success: true,
        results: { tasks: [], notes: [], messages: [], members: [], files: [] },
      })
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      workspace: workspaceId,
      status: 'active',
    }).populate('user', 'fullName email avatarUrl')
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const regex = buildRegex(q)
    const [tasks, notes, messages, members, files] = await Promise.all([
      Task.find({ workspace: workspaceId, archived: false, $or: [{ title: regex }, { description: regex }] })
        .select('title description status dueDate')
        .limit(8),
      Note.find({ workspace: workspaceId, isArchived: false, $or: [{ title: regex }, { plainText: regex }] })
        .select('title plainText updatedAt')
        .limit(8),
      Message.find({ workspace: workspaceId, deletedAt: null, content: regex })
        .populate('sender', 'fullName avatarUrl')
        .select('content sender channel createdAt')
        .sort({ createdAt: -1 })
        .limit(8),
      Membership.find({ workspace: workspaceId, status: 'active' })
        .populate('user', 'fullName email avatarUrl')
        .select('user role')
        .limit(50),
      FileAsset.find({
        workspace: workspaceId,
        $or: [{ originalName: regex }, { mimeType: regex }, { source: regex }],
      })
        .select('originalName mimeType source createdAt')
        .sort({ createdAt: -1 })
        .limit(8),
    ])

    const filteredMembers = members
      .filter(
        (item) =>
          item.user &&
          (regex.test(item.user.fullName || '') || regex.test(item.user.email || '')),
      )
      .slice(0, 8)

    return res.status(200).json({
      success: true,
      results: {
        tasks: tasks.map((item) => ({
          id: item._id,
          title: item.title,
          context: item.description || item.status,
          route: '/tasks',
        })),
        notes: notes.map((item) => ({
          id: item._id,
          title: item.title,
          context: item.plainText?.slice(0, 120) || 'Note',
          route: '/notes',
        })),
        messages: messages.map((item) => ({
          id: item._id,
          title: item.sender?.fullName || 'Message',
          context: item.content.slice(0, 120),
          route: '/chat',
        })),
        members: filteredMembers.map((item) => ({
          id: item.user._id,
          title: item.user.fullName,
          context: item.user.email,
          route: '/team',
        })),
        files: files.map((item) => ({
          id: item._id,
          title: item.originalName,
          context: `${item.source} | ${item.mimeType}`,
          route: '/files',
        })),
      },
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { globalSearch }
