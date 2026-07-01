import { api } from './api'
import type { CalendarEvent } from '../types/calendar'

export const calendarApi = {
  list: async (workspaceId: string, start?: string, end?: string) => {
    const response = await api.get<{ success: boolean; events: CalendarEvent[] }>('/calendar', {
      params: { workspace: workspaceId, start, end },
    })
    return response.data
  },
  create: async (payload: {
    workspace: string
    title: string
    description?: string
    date: string
    endDate?: string
    allDay?: boolean
    source?: string
    color?: string
  }) => {
    const response = await api.post<{ success: boolean; event: CalendarEvent }>('/calendar', payload)
    return response.data
  },
  update: async (eventId: string, payload: Partial<CalendarEvent>) => {
    const response = await api.patch<{ success: boolean; event: CalendarEvent }>(`/calendar/${eventId}`, payload)
    return response.data
  },
  delete: async (eventId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/calendar/${eventId}`)
    return response.data
  },
}
