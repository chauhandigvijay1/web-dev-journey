const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const sanitizeInput = require('./middleware/sanitizeInput')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandlers')
const logger = require('./services/logger')

let Sentry
if (process.env.SENTRY_DSN) {
  Sentry = require('@sentry/node')
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 0,
  })
}

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
const calendarRoutes = require('./routes/calendarRoutes')
const adminRoutes = require('./routes/adminRoutes')
const exportRoutes = require('./routes/exportRoutes')

const app = express()
app.set('trust proxy', 1)

const getAllowedOrigins = () => {
  const origins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    ...(process.env.CLIENT_ORIGINS || '').split(','),
  ]
  return origins.map((v) => v?.trim()).filter(Boolean)
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: (origin, callback) => {
  const allowed = getAllowedOrigins()
  if (!origin || allowed.includes(origin)) return callback(null, true)
  return callback(new Error('CORS origin not allowed'))
}, credentials: true }))

if (process.env.NODE_ENV !== 'production') {
  app.use(require('morgan')('dev'))
}

app.use(globalLimiter)
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(sanitizeInput)

if (Sentry && typeof Sentry.expressRequestHandler === 'function') {
  app.use(Sentry.expressRequestHandler())
} else if (Sentry && Sentry.Handlers && typeof Sentry.Handlers.requestHandler === 'function') {
  app.use(Sentry.Handlers.requestHandler())
}

const mountRoutes = (prefix) => {
  app.get(`${prefix}/health`, (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'DsSync Hub API' })
  })
  app.use(`${prefix}/auth`, authRoutes)
  app.use(`${prefix}/users`, userRoutes)
  app.use(`${prefix}/workspaces`, workspaceRoutes)
  app.use(`${prefix}/tasks`, taskRoutes)
  app.use(`${prefix}/notes`, noteRoutes)
  app.use(`${prefix}/chat`, chatRoutes)
  app.use(`${prefix}/channels`, channelRoutes)
  app.use(`${prefix}/notifications`, notificationRoutes)
  app.use(`${prefix}/activity`, activityRoutes)
  app.use(`${prefix}/ai`, aiRoutes)
  app.use(`${prefix}/search`, searchRoutes)
  app.use(`${prefix}/billing`, billingRoutes)
  app.use(`${prefix}/files`, fileRoutes)
  app.use(`${prefix}/meetings`, meetingRoutes)
  app.use(`${prefix}/calendar`, calendarRoutes)
  app.use(`${prefix}/admin`, adminRoutes)
  app.use(`${prefix}/export`, exportRoutes)
}

mountRoutes('/api')
mountRoutes('/api/v1')

if (Sentry && typeof Sentry.setupExpressErrorHandler === 'function') {
  Sentry.setupExpressErrorHandler(app)
} else if (Sentry && Sentry.Handlers && typeof Sentry.Handlers.errorHandler === 'function') {
  app.use(Sentry.Handlers.errorHandler())
}

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
