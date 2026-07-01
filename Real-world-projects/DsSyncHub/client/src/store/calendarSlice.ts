import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { calendarApi } from '../services/calendarApi'
import type { CalendarEvent, CalendarView } from '../types/calendar'

type CalendarState = {
  view: CalendarView
  selectedDate: string
  events: CalendarEvent[]
  loading: boolean
}

const initialState: CalendarState = {
  view: 'month',
  selectedDate: new Date().toISOString(),
  events: [],
  loading: false,
}

export const fetchCalendarEventsThunk = createAsyncThunk(
  'calendar/list',
  async (payload: { workspaceId: string; start?: string; end?: string }) => {
    const response = await calendarApi.list(payload.workspaceId, payload.start, payload.end)
    return response.events
  },
)

export const createCalendarEventThunk = createAsyncThunk(
  'calendar/create',
  async (payload: {
    workspace: string
    title: string
    description?: string
    date: string
    endDate?: string
    time?: string
    source?: string
    color?: string
  }) => {
    const response = await calendarApi.create({
      workspace: payload.workspace,
      title: payload.title,
      description: payload.description,
      date: payload.time
        ? new Date(`${payload.date.split('T')[0]}T${payload.time || '09:00'}`).toISOString()
        : new Date(payload.date).toISOString(),
      endDate: payload.endDate,
      source: payload.source || 'event',
      color: payload.color,
    })
    return response.event
  },
)

export const deleteCalendarEventThunk = createAsyncThunk(
  'calendar/delete',
  async (eventId: string) => {
    await calendarApi.delete(eventId)
    return eventId
  },
)

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setCalendarView: (state, action: PayloadAction<CalendarView>) => {
      state.view = action.payload
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
    },
    addCalendarEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.unshift(action.payload)
    },
    addIncomingCalendarEvent: (state, action: PayloadAction<CalendarEvent>) => {
      const exists = state.events.some((e) => e.id === action.payload.id)
      if (!exists) state.events.push(action.payload)
    },
    updateIncomingCalendarEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events = state.events.map((e) => (e.id === action.payload.id ? action.payload : e))
    },
    removeIncomingCalendarEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarEventsThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCalendarEventsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.events = action.payload
      })
      .addCase(fetchCalendarEventsThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(createCalendarEventThunk.fulfilled, (state, action) => {
        state.events.unshift(action.payload)
      })
      .addCase(deleteCalendarEventThunk.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e.id !== action.payload)
      })
  },
})

export const {
  setCalendarView,
  setSelectedDate,
  addCalendarEvent,
  addIncomingCalendarEvent,
  updateIncomingCalendarEvent,
  removeIncomingCalendarEvent,
} = calendarSlice.actions
export default calendarSlice.reducer
