export type FileAttachment = {
  fileId: string | null
  name: string
  url: string
  mimeType: string
  size: number
}

export type FileItem = {
  id: string
  workspace: string
  uploadedBy: {
    id: string
    fullName: string
    email: string
    avatarUrl: string
  } | null
  name: string
  originalName: string
  url: string
  previewUrl: string
  downloadUrl: string
  size: number
  mimeType: string
  source: 'chat' | 'task' | 'note' | 'general'
  linkedEntityId: string | null
  createdAt: string
}

export type StorageUsage = {
  usedMb: number
  limitMb: number
  percentUsed: number
}
