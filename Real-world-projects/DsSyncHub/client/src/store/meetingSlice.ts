import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { meetingApi } from '../services/meetingApi'
import type { MeetingItem } from '../types/meeting'

type MeetingState = {
  items: MeetingItem[]
  current: MeetingItem | null
  loading: boolean
}

const initialState: MeetingState = {
  items: [],
  current: null,
  loading: false,
}

export const fetchUpcomingMeetingsThunk = createAsyncThunk(
  'meeting/upcoming',
  async (workspaceId: string) => {
    const response = await meetingApi.upcoming(workspaceId)
    return response.meetings
  },
)

export const createMeetingRoomThunk = createAsyncThunk(
  'meeting/createRoom',
  async (
    payload: { workspace: string; title?: string; scheduledFor?: string | null },
    { dispatch },
  ) => {
    const response = await meetingApi.createRoom(payload)
    await dispatch(fetchUpcomingMeetingsThunk(payload.workspace))
    return response.meeting
  },
)

export const fetchMeetingRoomThunk = createAsyncThunk('meeting/room', async (roomId: string) => {
  const response = await meetingApi.room(roomId)
  return response.meeting
})

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingMeetingsThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUpcomingMeetingsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUpcomingMeetingsThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(createMeetingRoomThunk.fulfilled, (state, action) => {
        state.current = action.payload
      })
      .addCase(fetchMeetingRoomThunk.fulfilled, (state, action) => {
        state.current = action.payload
      })
  },
})

export default meetingSlice.reducer
