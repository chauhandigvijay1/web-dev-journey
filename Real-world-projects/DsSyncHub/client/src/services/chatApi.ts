import { api } from './api'
import type { ChannelItem, ChatMessage } from '../types/chat'
import type { FileAttachment } from '../types/file'

export const chatApi = {
  channels: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; channels: ChannelItem[] }>('/channels', {
      params: { workspace: workspaceId },
    })
    return response.data
  },
  createChannel: async (payload: {
    workspace: string
    name: string
    description?: string
    isPrivate?: boolean
  }) => {
    const response = await api.post<{ success: boolean; channel: ChannelItem }>('/channels', payload)
    return response.data
  },
  messages: async (workspaceId: string, channelId?: string) => {
    const response = await api.get<{ success: boolean; messages: ChatMessage[] }>(
      '/chat/messages',
      {
        params: { workspace: workspaceId, channel: channelId },
      },
    )
    return response.data
  },
  directMessages: async (workspaceId: string, userId: string) => {
    const response = await api.get<{ success: boolean; messages: ChatMessage[] }>(
      `/chat/direct/${userId}`,
      { params: { workspace: workspaceId } },
    )
    return response.data
  },
  sendMessage: async (payload: {
    workspace: string
    channel?: string | null
    recipient?: string | null
    content: string
    messageType?: 'text' | 'file' | 'system'
    attachments?: FileAttachment[]
    mentions?: string[]
  }) => {
    const response = await api.post<{ success: boolean; message: ChatMessage }>(
      '/chat/message',
      payload,
    )
    return response.data
  },
  editMessage: async (messageId: string, content: string) => {
    const response = await api.patch<{ success: boolean; message: ChatMessage }>(
      `/chat/message/${messageId}`,
      { content },
    )
    return response.data
  },
  deleteMessage: async (messageId: string) => {
    const response = await api.delete<{ success: boolean; messageId: string }>(
      `/chat/message/${messageId}`,
    )
    return response.data
  },
}
