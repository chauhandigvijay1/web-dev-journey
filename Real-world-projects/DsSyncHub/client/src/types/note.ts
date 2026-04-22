import type { FileAttachment } from './file'

export type NoteItem = {
  id: string
  workspace: string
  title: string
  slug: string
  content: string
  plainText: string
  coverImage: string
  icon: string
  folder: string
  tags: string[]
  attachments: FileAttachment[]
  createdBy: string
  updatedBy: string
  isPinned: boolean
  isArchived: boolean
  isShared: boolean
  sharedToken: string | null
  lastEditedAt: string
  version: number
  createdAt: string
  updatedAt: string
}

export type NoteFilter = 'all' | 'pinned' | 'shared' | 'archived'
