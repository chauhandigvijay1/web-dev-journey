import type { ActivityItem } from '../types/activity'
import { api } from './api'

export const activityApi = {
  list: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; activity: ActivityItem[] }>('/activity', {
      params: { workspace: workspaceId },
    })
    return response.data
  },
}
