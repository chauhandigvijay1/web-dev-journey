export type MeetingParticipant = {
  userId: string
  fullName: string
  avatarUrl: string
  joinedAt: string
}

export type MeetingItem = {
  id: string
  workspace: string
  roomId: string
  title: string
  createdBy: {
    id: string
    fullName: string
    email: string
    avatarUrl: string
  } | null
  scheduledFor: string | null
  status: 'upcoming' | 'live' | 'ended'
  participants: MeetingParticipant[]
  createdAt: string
  updatedAt: string
}
