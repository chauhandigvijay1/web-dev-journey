const multer = require('multer')
const path = require('path')
const Membership = require('../models/Membership')
const Message = require('../models/Message')
const Note = require('../models/Note')
const Task = require('../models/Task')
const FileAsset = require('../models/FileAsset')
const { createActivityLog } = require('../utils/collabEvents')
const {
  buildAttachment,
  ensureStorageAvailable,
  removeLocalFile,
  serializeFileAsset,
  storeLocally,
  validateIncomingFile,
} = require('../services/storageService')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

const canUpload = (role) => ['owner', 'admin', 'member'].includes(role)

const getMembership = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active' })

const removeAttachmentFromDocuments = async (fileId) => {
  const pullQuery = { 'attachments.fileId': fileId }
  await Promise.all([
    Task.updateMany(pullQuery, { $pull: { attachments: { fileId } } }),
    Note.updateMany(pullQuery, { $pull: { attachments: { fileId } } }),
    Message.updateMany(pullQuery, { $pull: { attachments: { fileId } } }),
  ])
}

const listFiles = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspace query is required.' })

    const membership = await getMembership(req.user._id, workspaceId)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const files = await FileAsset.find({ workspace: workspaceId })
      .populate('uploadedBy', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(200)

    return res.status(200).json({ success: true, files: files.map(serializeFileAsset) })
  } catch (error) {
    return next(error)
  }
}

const listRecentFiles = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    const limit = Math.min(Number(req.query.limit || 8), 20)
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspace query is required.' })

    const membership = await getMembership(req.user._id, workspaceId)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const files = await FileAsset.find({ workspace: workspaceId })
      .populate('uploadedBy', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(limit)

    return res.status(200).json({ success: true, files: files.map(serializeFileAsset) })
  } catch (error) {
    return next(error)
  }
}

const uploadFile = async (req, res, next) => {
  try {
    const { workspace, source = 'general', linkedEntityId = null } = req.body
    if (!workspace) return res.status(400).json({ success: false, message: 'workspace is required.' })

    const membership = await getMembership(req.user._id, workspace)
    if (!membership || !canUpload(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const validationError = validateIncomingFile(req.file)
    if (validationError) return res.status(400).json({ success: false, message: validationError })

    const storageCheck = await ensureStorageAvailable(workspace, req.file.size)
    if (!storageCheck.allowed) {
      return res.status(403).json({
        success: false,
        code: storageCheck.code,
        message: storageCheck.message,
        usage: storageCheck.usage,
      })
    }

    const stored = await storeLocally(req.file)
    const fileAsset = await FileAsset.create({
      workspace,
      uploadedBy: req.user._id,
      name: stored.name,
      originalName: req.file.originalname,
      url: stored.url,
      storagePath: stored.storagePath,
      provider: stored.provider,
      size: req.file.size,
      mimeType: req.file.mimetype,
      source: ['chat', 'task', 'note', 'general'].includes(source) ? source : 'general',
      linkedEntityId: linkedEntityId || null,
    })

    await createActivityLog({
      workspace,
      actor: req.user._id,
      action: 'file_uploaded',
      entityType: 'file',
      entityId: fileAsset._id,
      summary: `${req.user.fullName} uploaded ${req.file.originalname}.`,
      metadata: { source, linkedEntityId },
    })

    const populatedFile = await FileAsset.findById(fileAsset._id).populate('uploadedBy', 'fullName email avatarUrl')
    return res.status(201).json({
      success: true,
      file: serializeFileAsset(populatedFile),
      attachment: buildAttachment(fileAsset),
    })
  } catch (error) {
    return next(error)
  }
}

const deleteFile = async (req, res, next) => {
  try {
    const fileAsset = await FileAsset.findById(req.params.id).populate('uploadedBy', 'fullName email avatarUrl')
    if (!fileAsset) return res.status(404).json({ success: false, message: 'File not found.' })

    const membership = await getMembership(req.user._id, fileAsset.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const canDelete =
      fileAsset.uploadedBy?._id?.toString() === req.user._id.toString() || ['owner', 'admin'].includes(membership.role)
    if (!canDelete) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    await removeLocalFile(fileAsset)
    await removeAttachmentFromDocuments(String(fileAsset._id))
    await fileAsset.deleteOne()

    return res.status(200).json({ success: true, fileId: req.params.id })
  } catch (error) {
    return next(error)
  }
}

const streamFileContent = async (req, res, next) => {
  try {
    const storedName = path.basename(req.params.storedName || '')
    const fileAsset = await FileAsset.findOne({ name: storedName })
    if (!fileAsset) return res.status(404).json({ success: false, message: 'File not found.' })

    const membership = await getMembership(req.user._id, fileAsset.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const shouldDownload = req.query.download === '1'
    res.setHeader('Content-Type', fileAsset.mimeType)
    res.setHeader('Content-Length', String(fileAsset.size))
    if (shouldDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileAsset.originalName)}"`)
    }
    return res.sendFile(fileAsset.storagePath)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  deleteFile,
  listFiles,
  listRecentFiles,
  streamFileContent,
  upload,
  uploadFile,
}
