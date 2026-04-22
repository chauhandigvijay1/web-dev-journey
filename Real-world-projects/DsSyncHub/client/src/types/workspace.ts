export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'
export type MembershipStatus = 'active' | 'pending'

export type WorkspaceItem = {
  id: string
  name: string
  slug: string
  description: string
  logoUrl: string
  plan: 'free' | 'pro'
  inviteCode: string
  isArchived: boolean
  role: WorkspaceRole
  status: MembershipStatus
  membersCount: number
  createdAt: string
  updatedAt: string
  lastActive: string
}

export type WorkspaceMember = {
  id: string
  userId: string
  fullName: string
  username: string
  email: string
  avatarUrl: string
  role: WorkspaceRole
  status: MembershipStatus
  joinedAt: string
}
