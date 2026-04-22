import { api } from './api'
import type { WorkspaceItem, WorkspaceMember, WorkspaceRole } from '../types/workspace'

type WorkspaceResponse = {
  success: boolean
  workspaces: WorkspaceItem[]
}

type WorkspaceDetailsResponse = {
  success: boolean
  workspace: WorkspaceItem
}

type MembersResponse = {
  success: boolean
  members: WorkspaceMember[]
}

export const workspaceApi = {
  list: async () => {
    const response = await api.get<WorkspaceResponse>('/workspaces')
    return response.data
  },
  create: async (payload: { name: string; description: string }) => {
    const response = await api.post<WorkspaceDetailsResponse>('/workspaces', payload)
    return response.data
  },
  join: async (inviteCode: string) => {
    const response = await api.post<WorkspaceDetailsResponse>('/workspaces/join', {
      inviteCode,
    })
    return response.data
  },
  details: async (workspaceId: string) => {
    const response = await api.get<WorkspaceDetailsResponse>(`/workspaces/${workspaceId}`)
    return response.data
  },
  members: async (workspaceId: string) => {
    const response = await api.get<MembersResponse>(`/workspaces/${workspaceId}/members`)
    return response.data
  },
  inviteMember: async (workspaceId: string, payload: { email: string; role: WorkspaceRole }) => {
    const response = await api.post(`/workspaces/${workspaceId}/invite`, payload)
    return response.data
  },
  updateMemberRole: async (workspaceId: string, memberId: string, role: WorkspaceRole) => {
    const response = await api.patch(`/workspaces/${workspaceId}/members/${memberId}/role`, { role })
    return response.data
  },
  removeMember: async (workspaceId: string, memberId: string) => {
    const response = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
    return response.data
  },
}
