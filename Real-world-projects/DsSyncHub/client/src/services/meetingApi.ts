import type { MeetingItem } from '../types/meeting'
import { api } from './api'

export const meetingApi = {
  upcoming: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; meetings: MeetingItem[] }>('/meetings/upcoming', {
      params: { workspace: workspaceId },
    })
    return response.data
  },
  createRoom: async (payload: { workspace: string; title?: string; scheduledFor?: string | null }) => {
    const response = await api.post<{ success: boolean; meeting: MeetingItem }>('/meetings/rooms', payload)
    return response.data
  },
  room: async (roomId: string) => {
    const response = await api.get<{ success: boolean; meeting: MeetingItem }>(`/meetings/rooms/${roomId}`)
    return response.data
  },
}
