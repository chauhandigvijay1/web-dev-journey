export type NotificationType =
  | 'task_assigned'
  | 'mention'
  | 'invite'
  | 'due_reminder'
  | 'note_shared'
  | 'payment'
  | 'system'

export type NotificationItem = {
  id: string
  user: string
  workspace: string | null
  type: NotificationType
  title: string
  message: string
  link: string
  isRead: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
}
