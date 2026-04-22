import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CalendarEvent, CalendarView } from '../types/calendar'

type CalendarState = {
  view: CalendarView
  selectedDate: string
  events: CalendarEvent[]
}

const initialState: CalendarState = {
  view: 'month',
  selectedDate: new Date().toISOString(),
  events: [],
}

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
  },
})

export const { setCalendarView, setSelectedDate, addCalendarEvent } = calendarSlice.actions
export default calendarSlice.reducer
