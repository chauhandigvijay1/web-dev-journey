import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { activityApi } from '../services/activityApi'
import type { ActivityItem } from '../types/activity'

type ActivityState = {
  items: ActivityItem[]
  loading: boolean
}

const initialState: ActivityState = {
  items: [],
  loading: false,
}

export const fetchActivityThunk = createAsyncThunk('activity/list', async (workspaceId: string) => {
  const response = await activityApi.list(workspaceId)
  return response.activity
})

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchActivityThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchActivityThunk.rejected, (state) => {
        state.loading = false
      })
  },
})

export default activitySlice.reducer
