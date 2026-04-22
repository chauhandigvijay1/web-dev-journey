const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const sanitizeInput = require('./middleware/sanitizeInput')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandlers')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const workspaceRoutes = require('./routes/workspaceRoutes')
const taskRoutes = require('./routes/taskRoutes')
const noteRoutes = require('./routes/noteRoutes')
const chatRoutes = require('./routes/chatRoutes')
const channelRoutes = require('./routes/channelRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const activityRoutes = require('./routes/activityRoutes')
const aiRoutes = require('./routes/aiRoutes')
const searchRoutes = require('./routes/searchRoutes')
const billingRoutes = require('./routes/billingRoutes')
const fileRoutes = require('./routes/fileRoutes')
const meetingRoutes = require('./routes/meetingRoutes')

const app = express()
app.set('trust proxy', 1)
const fallbackClientOrigin = 'http://localhost:5173'

const getAllowedOrigins = () => {
  const origins = [
    process.env.CLIENT_URL || fallbackClientOrigin,
    ...(process.env.CLIENT_ORIGINS || '').split(','),
  ]

  return origins
    .map((value) => value?.trim())
    .filter(Boolean)
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins()
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('CORS origin not allowed'))
    },
    credentials: true,
  }),
)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}
app.use(globalLimiter)
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(sanitizeInput)

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'DsSync Hub API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/meetings', meetingRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
