import type { FileAttachment, FileItem } from '../types/file'
import { api } from './api'

export const fileApi = {
  list: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; files: FileItem[] }>('/files', {
      params: { workspace: workspaceId },
    })
    return response.data
  },
  recent: async (workspaceId: string, limit = 8) => {
    const response = await api.get<{ success: boolean; files: FileItem[] }>('/files/recent', {
      params: { workspace: workspaceId, limit },
    })
    return response.data
  },
  upload: async (payload: {
    workspace: string
    file: File
    source?: 'chat' | 'task' | 'note' | 'general'
    linkedEntityId?: string | null
  }) => {
    const formData = new FormData()
    formData.append('workspace', payload.workspace)
    formData.append('source', payload.source || 'general')
    if (payload.linkedEntityId) {
      formData.append('linkedEntityId', payload.linkedEntityId)
    }
    formData.append('file', payload.file)

    const response = await api.post<{ success: boolean; file: FileItem; attachment: FileAttachment }>(
      '/files/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
    return response.data
  },
  remove: async (fileId: string) => {
    const response = await api.delete<{ success: boolean; fileId: string }>(`/files/${fileId}`)
    return response.data
  },
}
