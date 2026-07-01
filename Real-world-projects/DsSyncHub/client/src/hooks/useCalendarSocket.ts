import { useEffect } from 'react'
import { useAppDispatch } from './redux'
import { connectSocket } from '../services/socket'
import {
  addIncomingCalendarEvent,
  removeIncomingCalendarEvent,
  updateIncomingCalendarEvent,
} from '../store/calendarSlice'

export const useCalendarSocket = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const socket = connectSocket()

    socket.on('calendar:created', (event) => dispatch(addIncomingCalendarEvent(event)))
    socket.on('calendar:updated', (event) => dispatch(updateIncomingCalendarEvent(event)))
    socket.on('calendar:deleted', ({ eventId }) => dispatch(removeIncomingCalendarEvent(eventId)))

    return () => {
      socket.off('calendar:created')
      socket.off('calendar:updated')
      socket.off('calendar:deleted')
    }
  }, [dispatch])

  return { socket: connectSocket() }
}
