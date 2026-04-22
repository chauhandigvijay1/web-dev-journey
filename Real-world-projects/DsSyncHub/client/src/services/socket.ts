import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

const socketBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace(
  /\/api$/,
  '',
)

export const getSocket = () => socket

export const connectSocket = () => {
  if (socket?.connected) return socket
  if (!socket) {
    socket = io(socketBaseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
  }
  if (!socket.connected) socket.connect()
  return socket
}

export const disconnectSocket = () => {
  if (socket) socket.disconnect()
}
