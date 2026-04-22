import type { TaskComment, TaskItem, TaskPriority, TaskStatus } from '../types/task'
import { api } from './api'

export const taskApi = {
  list: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; tasks: TaskItem[] }>('/tasks', {
      params: { workspace: workspaceId },
    })
    return response.data
  },
  create: async (payload: {
    workspace: string
    title: string
    description: string
    priority: TaskPriority
    assignee?: string
    dueDate?: string
    labels: string[]
  }) => {
    const response = await api.post<{ success: boolean; task: TaskItem }>('/tasks', payload)
    return response.data
  },
  update: async (taskId: string, payload: Partial<TaskItem>) => {
    const response = await api.patch<{ success: boolean; task: TaskItem }>(`/tasks/${taskId}`, payload)
    return response.data
  },
  remove: async (taskId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/tasks/${taskId}`)
    return response.data
  },
  move: async (taskId: string, payload: { status: TaskStatus; order: number }) => {
    const response = await api.patch<{ success: boolean; task: TaskItem }>(`/tasks/${taskId}/move`, payload)
    return response.data
  },
  complete: async (taskId: string) => {
    const response = await api.patch<{ success: boolean; task: TaskItem }>(`/tasks/${taskId}/complete`)
    return response.data
  },
  comments: async (taskId: string) => {
    const response = await api.get<{ success: boolean; comments: TaskComment[] }>(`/tasks/${taskId}/comments`)
    return response.data
  },
  addComment: async (taskId: string, payload: { content: string; mentions?: string[] }) => {
    const response = await api.post<{ success: boolean; comment: TaskComment }>(`/tasks/${taskId}/comments`, {
      content: payload.content,
      mentions: payload.mentions || [],
    })
    return response.data
  },
  updateComment: async (commentId: string, payload: { content: string; mentions?: string[] }) => {
    const response = await api.patch<{ success: boolean }>(`/tasks/comments/${commentId}`, {
      content: payload.content,
      mentions: payload.mentions || [],
    })
    return response.data
  },
  deleteComment: async (commentId: string) => {
    const response = await api.delete<{ success: boolean }>(`/tasks/comments/${commentId}`)
    return response.data
  },
}
