import { useEffect } from 'react'
import { useAppDispatch } from './redux'
import { connectSocket } from '../services/socket'
import {
  addIncomingNote,
  removeIncomingNote,
  updateIncomingNote,
} from '../store/noteSlice'

export const useNoteSocket = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const socket = connectSocket()

    socket.on('note:created', (note) => dispatch(addIncomingNote(note)))
    socket.on('note:updated', (note) => dispatch(updateIncomingNote(note)))
    socket.on('note:deleted', ({ noteId }) => dispatch(removeIncomingNote(noteId)))

    return () => {
      socket.off('note:created')
      socket.off('note:updated')
      socket.off('note:deleted')
    }
  }, [dispatch])

  return { socket: connectSocket() }
}
