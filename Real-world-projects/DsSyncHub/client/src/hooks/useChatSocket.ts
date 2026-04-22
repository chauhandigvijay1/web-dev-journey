import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { connectSocket, disconnectSocket } from '../services/socket'
import {
  addIncomingMessage,
  applyMessageDelete,
  applyMessageUpdate,
  clearTypingUser,
  setConnectionState,
  setOnlineUsers,
  setTypingUser,
} from '../store/chatSlice'

export const useChatSocket = () => {
  const dispatch = useAppDispatch()
  const workspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId)
  const channelId = useAppSelector((state) => state.chat.currentChannelId)

  useEffect(() => {
    const socket = connectSocket()
    dispatch(setConnectionState('connecting'))

    socket.on('connect', () => dispatch(setConnectionState('connected')))
    socket.on('disconnect', () => dispatch(setConnectionState('disconnected')))
    socket.on('message_received', (message) => dispatch(addIncomingMessage(message)))
    socket.on('user_typing', (payload) =>
      dispatch(setTypingUser({ userId: payload.userId, fullName: payload.fullName })),
    )
    socket.on('typing_stopped', (payload) => dispatch(clearTypingUser(payload.userId)))
    socket.on('online_users', (payload) => dispatch(setOnlineUsers(payload.users || [])))
    socket.on('message_updated', (payload) => dispatch(applyMessageUpdate(payload)))
    socket.on('message_deleted', (payload) => dispatch(applyMessageDelete(payload)))

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('message_received')
      socket.off('user_typing')
      socket.off('typing_stopped')
      socket.off('online_users')
      socket.off('message_updated')
      socket.off('message_deleted')
      disconnectSocket()
    }
  }, [dispatch])

  useEffect(() => {
    const socket = connectSocket()
    if (!workspaceId) return
    socket.emit('join_workspace', { workspaceId })
  }, [workspaceId])

  useEffect(() => {
    const socket = connectSocket()
    if (!workspaceId || !channelId) return
    socket.emit('join_channel', { workspaceId, channelId })
    return () => {
      socket.emit('leave_channel', { channelId })
    }
  }, [workspaceId, channelId])

  return { socket: connectSocket() }
}
