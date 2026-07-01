import { useEffect } from 'react'
import { useAppDispatch } from './redux'
import { connectSocket } from '../services/socket'
import {
  addIncomingTask,
  removeIncomingTask,
  updateIncomingTask,
} from '../store/taskSlice'

export const useTaskSocket = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const socket = connectSocket()

    socket.on('task:created', (task) => dispatch(addIncomingTask(task)))
    socket.on('task:updated', (task) => dispatch(updateIncomingTask(task)))
    socket.on('task:moved', (task) => dispatch(updateIncomingTask(task)))
    socket.on('task:deleted', ({ taskId }) => dispatch(removeIncomingTask(taskId)))

    return () => {
      socket.off('task:created')
      socket.off('task:updated')
      socket.off('task:moved')
      socket.off('task:deleted')
    }
  }, [dispatch])

  return { socket: connectSocket() }
}
