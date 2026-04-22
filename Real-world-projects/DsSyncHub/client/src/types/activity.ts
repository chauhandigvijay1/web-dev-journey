export type ActivityEntityType =
  | 'task'
  | 'note'
  | 'message'
  | 'workspace'
  | 'member'
  | 'billing'
  | 'file'
  | 'meeting'

export type ActivityItem = {
  id: string
  workspace: string
  actor: {
    id: string
    fullName: string
    email: string
    avatarUrl: string
  } | null
  action: string
  entityType: ActivityEntityType
  entityId: string | null
  summary: string
  metadata: Record<string, unknown> | null
  createdAt: string
}
