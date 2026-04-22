const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')
const connectDB = require('./config/db')
const { registerChatSocket } = require('./socket/chatSocket')

dotenv.config()

const port = process.env.PORT || 5000
const server = http.createServer(app)
const getAllowedOrigins = () => {
  const origins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    ...(process.env.CLIENT_ORIGINS || '').split(','),
  ]

  return origins
    .map((value) => value?.trim())
    .filter(Boolean)
}

const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
})

registerChatSocket(io)

const startServer = async () => {
  try {
    await connectDB()
    server.listen(port, () => {
      console.log('---------------------------------------')
      console.log(`DsSync Hub API running on port ${port}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log('---------------------------------------')
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
