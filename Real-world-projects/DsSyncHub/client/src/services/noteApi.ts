import { api } from './api'
import type { NoteItem } from '../types/note'

export const noteApi = {
  list: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; notes: NoteItem[] }>('/notes', {
      params: { workspace: workspaceId },
    })
    return response.data
  },
  create: async (payload: { workspace: string; title?: string }) => {
    const response = await api.post<{ success: boolean; note: NoteItem }>('/notes', payload)
    return response.data
  },
  get: async (noteId: string) => {
    const response = await api.get<{ success: boolean; note: NoteItem }>(`/notes/${noteId}`)
    return response.data
  },
  update: async (noteId: string, payload: Partial<NoteItem>) => {
    const response = await api.patch<{ success: boolean; note: NoteItem }>(`/notes/${noteId}`, payload)
    return response.data
  },
  delete: async (noteId: string) => {
    const response = await api.delete<{ success: boolean }>(`/notes/${noteId}`)
    return response.data
  },
  pin: async (noteId: string) => {
    const response = await api.patch<{ success: boolean; note: NoteItem }>(`/notes/${noteId}/pin`)
    return response.data
  },
  archive: async (noteId: string) => {
    const response = await api.patch<{ success: boolean; note: NoteItem }>(`/notes/${noteId}/archive`)
    return response.data
  },
  duplicate: async (noteId: string) => {
    const response = await api.post<{ success: boolean; note: NoteItem }>(`/notes/${noteId}/duplicate`)
    return response.data
  },
  share: async (noteId: string) => {
    const response = await api.post<{ success: boolean; token: string }>(`/notes/${noteId}/share`)
    return response.data
  },
  shared: async (token: string) => {
    const response = await api.get<{ success: boolean; note: NoteItem }>(`/notes/shared/${token}`)
    return response.data
  },
}
