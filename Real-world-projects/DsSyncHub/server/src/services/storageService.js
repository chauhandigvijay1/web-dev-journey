const crypto = require('crypto')
const fs = require('fs/promises')
const mongoose = require('mongoose')
const path = require('path')
const FileAsset = require('../models/FileAsset')
const { getPlanLimits } = require('./planLimits')

const localUploadsDir = path.resolve(__dirname, '../../uploads')

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
])

const maxUploadBytes = 25 * 1024 * 1024
const allowedExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.txt',
  '.csv',
  '.zip',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.mp3',
  '.wav',
  '.mp4',
])

const safeBaseName = (value = '') =>
  String(value)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

const getFileExtension = (fileName = '') => {
  const extension = path.extname(fileName || '').toLowerCase()
  return extension.slice(0, 12)
}

const ensureLocalUploadsDir = async () => {
  await fs.mkdir(localUploadsDir, { recursive: true })
}

const formatMegabytes = (bytes = 0) => Number((bytes / (1024 * 1024)).toFixed(2))

const getStorageLimitMb = (limits) => limits.storageLimitMb || 512
const getStorageLimitBytes = (limits) => getStorageLimitMb(limits) * 1024 * 1024

const validateIncomingFile = (file) => {
  if (!file) return 'A file is required.'
  if (!allowedMimeTypes.has(file.mimetype)) return 'This file type is not supported.'
  if (!allowedExtensions.has(getFileExtension(file.originalname))) return 'This file extension is not supported.'
  if (!file.size || file.size > maxUploadBytes) return 'Files must be 25MB or smaller.'
  return null
}

const storeLocally = async (file) => {
  await ensureLocalUploadsDir()
  const extension = getFileExtension(file.originalname)
  const token = crypto.randomBytes(10).toString('hex')
  const baseName = safeBaseName(path.basename(file.originalname, extension)) || 'upload'
  const storedName = `${Date.now()}-${token}-${baseName}${extension}`
  const absolutePath = path.join(localUploadsDir, storedName)
  await fs.writeFile(absolutePath, file.buffer)

  return {
    name: storedName,
    url: `/api/files/content/${storedName}`,
    storagePath: absolutePath,
    provider: 'local',
  }
}

const buildAttachment = (fileAsset) => ({
  fileId: String(fileAsset._id),
  name: fileAsset.originalName,
  url: fileAsset.url,
  mimeType: fileAsset.mimeType,
  size: fileAsset.size,
})

const normalizeAttachment = (item) => {
  if (!item) return null
  if (typeof item === 'string') {
    return {
      fileId: null,
      name: item,
      url: item,
      mimeType: 'application/octet-stream',
      size: 0,
    }
  }

  if (typeof item !== 'object') return null

  return {
    fileId: item.fileId ? String(item.fileId) : null,
    name: String(item.name || item.originalName || 'Attachment').slice(0, 160),
    url: String(item.url || ''),
    mimeType: String(item.mimeType || 'application/octet-stream'),
    size: Number(item.size || 0),
  }
}

const normalizeAttachments = (items = []) =>
  Array.isArray(items)
    ? items.map(normalizeAttachment).filter((item) => item && item.url).slice(0, 12)
    : []

const serializeFileAsset = (fileAsset) => ({
  id: String(fileAsset._id),
  workspace: String(fileAsset.workspace),
  uploadedBy:
    fileAsset.uploadedBy && typeof fileAsset.uploadedBy === 'object'
      ? {
          id: String(fileAsset.uploadedBy._id),
          fullName: fileAsset.uploadedBy.fullName,
          email: fileAsset.uploadedBy.email,
          avatarUrl: fileAsset.uploadedBy.avatarUrl || '',
        }
      : null,
  name: fileAsset.name,
  originalName: fileAsset.originalName,
  url: fileAsset.url,
  previewUrl: fileAsset.url,
  downloadUrl: `${fileAsset.url}?download=1`,
  size: fileAsset.size,
  mimeType: fileAsset.mimeType,
  source: fileAsset.source,
  linkedEntityId: fileAsset.linkedEntityId ? String(fileAsset.linkedEntityId) : null,
  createdAt: fileAsset.createdAt,
})

const getStorageUsageBytes = async (workspaceId) => {
  if (!mongoose.Types.ObjectId.isValid(String(workspaceId))) {
    return 0
  }
  const [summary] = await FileAsset.aggregate([
    { $match: { workspace: new mongoose.Types.ObjectId(String(workspaceId)) } },
    { $group: { _id: '$workspace', total: { $sum: '$size' } } },
  ])

  return summary?.total || 0
}

const getStorageUsageSummary = async (workspaceId) => {
  const limits = await getPlanLimits(workspaceId)
  const usedBytes = await getStorageUsageBytes(workspaceId)
  const limitBytes = getStorageLimitBytes(limits)

  return {
    usedBytes,
    limitBytes,
    usedMb: formatMegabytes(usedBytes),
    limitMb: getStorageLimitMb(limits),
    percentUsed: limitBytes > 0 ? Math.min(100, Math.round((usedBytes / limitBytes) * 100)) : 0,
    plan: limits.plan,
  }
}

const ensureStorageAvailable = async (workspaceId, incomingBytes) => {
  const limits = await getPlanLimits(workspaceId)
  const usedBytes = await getStorageUsageBytes(workspaceId)
  const limitBytes = getStorageLimitBytes(limits)

  if (usedBytes + incomingBytes > limitBytes) {
    return {
      allowed: false,
      code: 'storage_limit_exceeded',
      message: 'Storage limit reached for current plan. Upgrade to Pro to upload more files.',
      usage: {
        usedBytes,
        limitBytes,
        usedMb: formatMegabytes(usedBytes),
        limitMb: getStorageLimitMb(limits),
      },
      limits,
    }
  }

  return { allowed: true, limits }
}

const removeLocalFile = async (fileAsset) => {
  try {
    await fs.unlink(fileAsset.storagePath)
  } catch (_error) {
    return null
  }
  return null
}

module.exports = {
  allowedMimeTypes,
  buildAttachment,
  ensureStorageAvailable,
  formatMegabytes,
  getStorageUsageSummary,
  maxUploadBytes,
  normalizeAttachments,
  removeLocalFile,
  serializeFileAsset,
  storeLocally,
  validateIncomingFile,
}
