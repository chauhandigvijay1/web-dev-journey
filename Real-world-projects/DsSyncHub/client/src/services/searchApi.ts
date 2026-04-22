import type { SearchResults } from '../types/search'
import { api } from './api'

export const searchApi = {
  query: async (workspaceId: string, q: string) => {
    const response = await api.get<{ success: boolean; results: SearchResults }>('/search', {
      params: { workspace: workspaceId, q },
    })
    return response.data
  },
}
