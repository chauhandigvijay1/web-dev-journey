const dotenv = require('dotenv')
dotenv.config()

const http = require('http')
const { Server } = require('socket.io')
const cron = require('node-cron')
const app = require('./app')
const connectDB = require('./config/db')
const logger = require('./services/logger')
const { registerChatSocket } = require('./socket/chatSocket')
const { registerTaskSocket } = require('./socket/taskSocket')
const { registerNoteSocket } = require('./socket/noteSocket')
const { registerCalendarSocket } = require('./socket/calendarSocket')
const { getEmailQueue } = require('./services/emailQueue')
const { cleanupExpiredTokens } = require('./scripts/cleanupExpiredTokens')

const port = process.env.PORT || 5000
const server = http.createServer(app)

const getAllowedOrigins = () => {
  const origins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    ...(process.env.CLIENT_ORIGINS || '').split(','),
  ]
  return origins.map((v) => v?.trim()).filter(Boolean)
}

const io = new Server(server, {
  cors: { origin: getAllowedOrigins(), credentials: true },
})

registerChatSocket(io)
registerTaskSocket(io)
registerNoteSocket(io)
registerCalendarSocket(io)

let redisClient = null
if (process.env.REDIS_URL) {
  const Redis = require('ioredis')
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null
      return Math.min(times * 200, 2000)
    },
  })
  redisClient.on('error', (err) => logger.error({ err: err.message }, 'Redis error'))
  redisClient.on('connect', () => logger.info('Redis connected'))

  const { createAdapter } = require('@socket.io/redis-adapter')
  const subClient = redisClient.duplicate()
  io.adapter(createAdapter(redisClient, subClient))
  logger.info('Socket.io Redis adapter enabled')
}

getEmailQueue()

cron.schedule('0 */6 * * *', () => {
  cleanupExpiredTokens()
})
logger.info('Expired token cleanup cron scheduled (every 6 hours)')

const startServer = async () => {
  try {
    await connectDB()
    server.listen(port, () => {
      logger.info({ port, env: process.env.NODE_ENV || 'development' }, 'DsSync Hub API started')
    })
  } catch (error) {
    logger.fatal({ err: error.message }, 'Failed to start server')
    process.exit(1)
  }
}

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'UNCAUGHT EXCEPTION')
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'UNHANDLED REJECTION')
  server.close(() => process.exit(1))
})

startServer()
