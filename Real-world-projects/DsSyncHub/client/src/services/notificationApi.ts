import type { NotificationItem } from '../types/notification'
import { api } from './api'

type NotificationsResponse = {
  success: boolean
  notifications: NotificationItem[]
  unreadCount: number
}

export const notificationApi = {
  list: async () => {
    const response = await api.get<NotificationsResponse>('/notifications')
    return response.data
  },
  markRead: async (notificationId: string) => {
    const response = await api.patch<{ success: boolean; notification: NotificationItem }>(
      `/notifications/${notificationId}/read`,
    )
    return response.data
  },
  markAllRead: async () => {
    const response = await api.patch<{ success: boolean; message: string }>('/notifications/read-all')
    return response.data
  },
  remove: async (notificationId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/notifications/${notificationId}`)
    return response.data
  },
}
