import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { chatApi } from '../services/chatApi'
import type { ChannelItem, ChatMessage, TypingUser } from '../types/chat'
import type { FileAttachment } from '../types/file'

type ChatState = {
  connectionState: 'disconnected' | 'connecting' | 'connected'
  channels: ChannelItem[]
  currentChannelId: string | null
  directUserId: string | null
  messages: ChatMessage[]
  typingUsers: TypingUser[]
  onlineUsers: Array<{ userId: string; fullName: string; avatarUrl: string }>
  loading: boolean
}

const initialState: ChatState = {
  connectionState: 'disconnected',
  channels: [],
  currentChannelId: null,
  directUserId: null,
  messages: [],
  typingUsers: [],
  onlineUsers: [],
  loading: false,
}

export const fetchChannelsThunk = createAsyncThunk('chat/channels', async (workspaceId: string) => {
  const response = await chatApi.channels(workspaceId)
  return response.channels
})

export const createChannelThunk = createAsyncThunk(
  'chat/createChannel',
  async (payload: { workspace: string; name: string; description?: string; isPrivate?: boolean }) => {
    const response = await chatApi.createChannel(payload)
    return response.channel
  },
)

export const fetchMessagesThunk = createAsyncThunk(
  'chat/messages',
  async (payload: { workspaceId: string; channelId?: string | null }) => {
    const response = await chatApi.messages(payload.workspaceId, payload.channelId || undefined)
    return response.messages
  },
)

export const fetchDirectMessagesThunk = createAsyncThunk(
  'chat/directMessages',
  async (payload: { workspaceId: string; userId: string }) => {
    const response = await chatApi.directMessages(payload.workspaceId, payload.userId)
    return response.messages
  },
)

export const sendMessageThunk = createAsyncThunk(
  'chat/sendMessage',
  async (payload: {
    workspace: string
    channel?: string | null
    recipient?: string | null
    content: string
    attachments?: FileAttachment[]
    mentions?: string[]
  }) => {
    const response = await chatApi.sendMessage(payload)
    return response.message
  },
)

export const editMessageThunk = createAsyncThunk(
  'chat/editMessage',
  async (payload: { messageId: string; content: string }) => {
    const response = await chatApi.editMessage(payload.messageId, payload.content)
    return response.message
  },
)

export const deleteMessageThunk = createAsyncThunk('chat/deleteMessage', async (messageId: string) => {
  const response = await chatApi.deleteMessage(messageId)
  return response.messageId
})

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnectionState: (state, action: PayloadAction<ChatState['connectionState']>) => {
      state.connectionState = action.payload
    },
    setCurrentChannelId: (state, action: PayloadAction<string | null>) => {
      state.currentChannelId = action.payload
      state.directUserId = null
    },
    setDirectUserId: (state, action: PayloadAction<string | null>) => {
      state.directUserId = action.payload
      state.currentChannelId = null
    },
    addIncomingMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (!state.messages.some((message) => message._id === action.payload._id)) {
        state.messages.push(action.payload)
      }
    },
    setTypingUser: (state, action: PayloadAction<TypingUser>) => {
      if (!state.typingUsers.some((user) => user.userId === action.payload.userId)) {
        state.typingUsers.push(action.payload)
      }
    },
    clearTypingUser: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter((user) => user.userId !== action.payload)
    },
    setOnlineUsers: (
      state,
      action: PayloadAction<Array<{ userId: string; fullName: string; avatarUrl: string }>>,
    ) => {
      state.onlineUsers = action.payload
    },
    applyMessageUpdate: (
      state,
      action: PayloadAction<{ messageId: string; content: string; editedAt: string }>,
    ) => {
      state.messages = state.messages.map((message) =>
        message._id === action.payload.messageId
          ? { ...message, content: action.payload.content, editedAt: action.payload.editedAt }
          : message,
      )
    },
    applyMessageDelete: (state, action: PayloadAction<{ messageId: string }>) => {
      state.messages = state.messages.filter((message) => message._id !== action.payload.messageId)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannelsThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchChannelsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.channels = action.payload
        if (!state.currentChannelId && action.payload[0]) {
          state.currentChannelId = action.payload[0]._id
        }
      })
      .addCase(fetchChannelsThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(createChannelThunk.fulfilled, (state, action) => {
        state.channels.push(action.payload)
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        state.messages = action.payload
      })
      .addCase(fetchDirectMessagesThunk.fulfilled, (state, action) => {
        state.messages = action.payload
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        if (!state.messages.some((message) => message._id === action.payload._id)) {
          state.messages.push(action.payload)
        }
      })
      .addCase(editMessageThunk.fulfilled, (state, action) => {
        state.messages = state.messages.map((message) =>
          message._id === action.payload._id ? action.payload : message,
        )
      })
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        state.messages = state.messages.filter((message) => message._id !== action.payload)
      })
  },
})

export const {
  setConnectionState,
  setCurrentChannelId,
  setDirectUserId,
  addIncomingMessage,
  setTypingUser,
  clearTypingUser,
  setOnlineUsers,
  applyMessageUpdate,
  applyMessageDelete,
} = chatSlice.actions

export default chatSlice.reducer
