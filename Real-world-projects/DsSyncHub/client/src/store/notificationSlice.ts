import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { notificationApi } from '../services/notificationApi'
import type { NotificationItem } from '../types/notification'

type NotificationState = {
  items: NotificationItem[]
  unreadCount: number
  loading: boolean
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
}

export const fetchNotificationsThunk = createAsyncThunk('notification/list', async () => {
  return notificationApi.list()
})

export const markNotificationReadThunk = createAsyncThunk('notification/markRead', async (notificationId: string) => {
  return notificationApi.markRead(notificationId)
})

export const markAllNotificationsReadThunk = createAsyncThunk('notification/markAllRead', async () => {
  await notificationApi.markAllRead()
})

export const removeNotificationThunk = createAsyncThunk('notification/remove', async (notificationId: string) => {
  await notificationApi.remove(notificationId)
  return notificationId
})

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotificationsThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.notification.id ? action.payload.notification : item))
        state.unreadCount = state.items.filter((item) => !item.isRead).length
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true }))
        state.unreadCount = 0
      })
      .addCase(removeNotificationThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.unreadCount = state.items.filter((item) => !item.isRead).length
      })
  },
})

export default notificationSlice.reducer
