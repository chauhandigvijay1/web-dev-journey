const crypto = require('crypto')
const Membership = require('../models/Membership')
const Note = require('../models/Note')
const { createActivityLog, createNotification } = require('../utils/collabEvents')
const { normalizeAttachments } = require('../services/storageService')

const canEdit = (role) => ['owner', 'admin', 'member'].includes(role)

const getMembership = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active' })

const makePlainText = (htmlContent = '') =>
  htmlContent
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const sanitizeNoteContent = (htmlContent = '') =>
  String(htmlContent)
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)=["']javascript:[^"']*["']/gi, '')
    .replace(/\s(srcdoc|formaction)=["'][^"']*["']/gi, '')

const toNote = (note) => ({
  id: note._id,
  workspace: note.workspace,
  title: note.title,
  slug: note.slug,
  content: note.content,
  plainText: note.plainText,
  coverImage: note.coverImage,
  icon: note.icon,
  folder: note.folder,
  tags: note.tags,
  attachments: normalizeAttachments(note.attachments),
  createdBy: note.createdBy,
  updatedBy: note.updatedBy,
  isPinned: note.isPinned,
  isArchived: note.isArchived,
  isShared: note.isShared,
  sharedToken: note.sharedToken,
  lastEditedAt: note.lastEditedAt,
  version: note.version,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
})

const listNotes = async (req, res, next) => {
  try {
    const { workspace } = req.query
    if (!workspace) return res.status(400).json({ success: false, message: 'workspace query is required.' })

    const membership = await getMembership(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const notes = await Note.find({ workspace }).sort({ isArchived: 1, isPinned: -1, lastEditedAt: -1 })
    return res.status(200).json({ success: true, notes: notes.map(toNote) })
  } catch (error) {
    return next(error)
  }
}

const createNote = async (req, res, next) => {
  try {
    const { workspace, title = 'Untitled Note', content = '', icon = 'N', folder = '', tags = [] } = req.body
    if (!workspace) return res.status(400).json({ success: false, message: 'Workspace is required.' })
    const membership = await getMembership(req.user._id, workspace)
    if (!membership || !canEdit(membership.role)) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const safeContent = sanitizeNoteContent(content)
    const note = await Note.create({
      workspace,
      title: title.trim() || 'Untitled Note',
      content: safeContent,
      plainText: makePlainText(safeContent),
      icon,
      folder: folder.trim(),
      tags: Array.isArray(tags) ? tags : [],
      attachments: [],
      createdBy: req.user._id,
      updatedBy: req.user._id,
      lastEditedAt: new Date(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    })

    return res.status(201).json({
      success: true,
      note: toNote(note),
      activity: { type: 'note_created', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note || note.isArchived) return res.status(404).json({ success: false, message: 'Note not found.' })
    const membership = await getMembership(req.user._id, note.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })
    return res.status(200).json({ success: true, note: toNote(note) })
  } catch (error) {
    return next(error)
  }
}

const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note || note.isArchived) return res.status(404).json({ success: false, message: 'Note not found.' })
    const membership = await getMembership(req.user._id, note.workspace)
    if (!membership || !canEdit(membership.role)) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const { title, content, coverImage, icon, folder, tags, isPinned, attachments } = req.body
    if (typeof title === 'string') note.title = title.trim() || 'Untitled Note'
    if (typeof content === 'string') {
      const safeContent = sanitizeNoteContent(content)
      note.content = safeContent
      note.plainText = makePlainText(safeContent)
    }
    if (typeof coverImage === 'string') note.coverImage = coverImage
    if (typeof icon === 'string') note.icon = icon
    if (typeof folder === 'string') note.folder = folder.trim()
    if (Array.isArray(tags)) note.tags = tags
    if (Array.isArray(attachments)) note.attachments = normalizeAttachments(attachments)
    if (typeof isPinned === 'boolean') note.isPinned = isPinned
    note.lastEditedAt = new Date()
    note.updatedBy = req.user._id
    note.version += 1
    await note.save()

    await createActivityLog({
      workspace: note.workspace,
      actor: req.user._id,
      action: 'note_edited',
      entityType: 'note',
      entityId: note._id,
      summary: `${req.user.fullName} updated note "${note.title}".`,
    })

    return res.status(200).json({
      success: true,
      note: toNote(note),
      activity: { type: 'note_updated', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const archiveNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' })
    const membership = await getMembership(req.user._id, note.workspace)
    if (!membership || !canEdit(membership.role)) return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    note.isArchived = true
    note.lastEditedAt = new Date()
    note.updatedBy = req.user._id
    await note.save()
    return res.status(200).json({ success: true, message: 'Note archived.' })
  } catch (error) {
    return next(error)
  }
}

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' })
    const membership = await getMembership(req.user._id, note.workspace)
    if (!membership || !canEdit(membership.role)) return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    await note.deleteOne()
    return res.status(200).json({ success: true, message: 'Note deleted.' })
  } catch (error) {
    return next(error)
  }
}

const togglePin = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' })
    const membership = await getMembership(req.user._id, note.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })
    note.isPinned = !note.isPinned
    note.lastEditedAt = new Date()
    note.updatedBy = req.user._id
    await note.save()
    return res.status(200).json({ success: true, note: toNote(note) })
  } catch (error) {
    return next(error)
  }
}

const toggleArchive = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' })
    const membership = await getMembership(req.user._id, note.workspace)
    if (!membership || !canEdit(membership.role)) return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    note.isArchived = !note.isArchived
    note.lastEditedAt = new Date()
    note.updatedBy = req.user._id
    await note.save()
    return res.status(200).json({
      success: true,
      note: toNote(note),
      activity: { type: 'note_archived', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const duplicateNote = async (req, res, next) => {
  try {
    const source = await Note.findById(req.params.id)
    if (!source || source.isArchived) return res.status(404).json({ success: false, message: 'Note not found.' })
    const membership = await getMembership(req.user._id, source.workspace)
    if (!membership || !canEdit(membership.role)) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const note = await Note.create({
      workspace: source.workspace,
      title: `${source.title} (Copy)`,
      slug: '',
      content: source.content,
      plainText: source.plainText,
      coverImage: source.coverImage,
      icon: source.icon,
      folder: source.folder,
      tags: source.tags,
      attachments: normalizeAttachments(source.attachments),
      createdBy: req.user._id,
      updatedBy: req.user._id,
      lastEditedAt: new Date(),
    })

    return res.status(201).json({ success: true, note: toNote(note) })
  } catch (error) {
    return next(error)
  }
}

const shareNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' })
    const membership = await getMembership(req.user._id, note.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    if (!note.sharedToken) {
      note.sharedToken = crypto.randomBytes(16).toString('hex')
    }
    note.isShared = true
    await note.save()
    await createNotification({
      user: note.createdBy,
      workspace: note.workspace,
      type: 'note_shared',
      title: 'Note sharing enabled',
      message: `"${note.title}" is now shareable via public link.`,
      link: '/notes',
      metadata: { noteId: note._id },
    })

    return res.status(200).json({
      success: true,
      token: note.sharedToken,
      noteId: note._id,
      activity: { type: 'note_shared', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const getSharedNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ sharedToken: req.params.token, isShared: true })
    if (!note || note.isArchived) return res.status(404).json({ success: false, message: 'Shared note not found.' })
    return res.status(200).json({ success: true, note: toNote(note) })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  listNotes,
  createNote,
  getNote,
  updateNote,
  archiveNote,
  deleteNote,
  togglePin,
  toggleArchive,
  duplicateNote,
  shareNote,
  getSharedNote,
}
