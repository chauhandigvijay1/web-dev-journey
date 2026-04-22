import type { FileAttachment } from './file'

export type ChannelItem = {
  _id: string
  workspace: string
  name: string
  slug: string
  description: string
  isPrivate: boolean
  createdBy: string
  createdAt: string
}

export type ChatMessage = {
  _id: string
  workspace: string
  channel: string | null
  recipient: string | null
  content: string
  messageType: 'text' | 'file' | 'system'
  attachments: FileAttachment[]
  mentions?: string[]
  editedAt: string | null
  deletedAt: string | null
  seenBy: string[]
  sender: {
    _id: string
    fullName: string
    email: string
    avatarUrl: string
  }
  createdAt: string
  updatedAt: string
}

export type TypingUser = {
  userId: string
  fullName: string
}
