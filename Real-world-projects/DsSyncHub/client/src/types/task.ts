import type { FileAttachment } from './file'

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export type TaskItem = {
  id: string
  workspace: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee:
    | {
        _id: string
        fullName: string
        email: string
        avatarUrl: string
      }
    | null
  createdBy: string
  dueDate: string | null
  labels: string[]
  attachments: FileAttachment[]
  order: number
  completedAt: string | null
  archived: boolean
  commentsCount: number
  createdAt: string
  updatedAt: string
}

export type TaskComment = {
  id: string
  task: string
  userId: string
  userName: string
  avatarUrl: string
  content: string
  editedAt?: string | null
  mentions?: string[]
  createdAt: string
}
