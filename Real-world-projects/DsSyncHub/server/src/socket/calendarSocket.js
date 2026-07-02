const Membership = require('../models/Membership')
const User = require('../models/User')
const { verifyToken } = require('../utils/jwt')

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const [key, ...value] = item.split('=')
      if (!key) return acc
      acc[key] = decodeURIComponent(value.join('='))
      return acc
    }, {})

const registerCalendarSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const authToken =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        parseCookies(socket.handshake.headers?.cookie).accessToken

      if (!authToken) return next(new Error('Unauthorized'))

      const payload = verifyToken(authToken)
      const user = await User.findById(payload.sub).select('-passwordHash')
      if (!user || !user.isActive) return next(new Error('Unauthorized'))
      if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) return next(new Error('Unauthorized'))

      socket.user = user
      return next()
    } catch (_error) {
      return next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('calendar:create', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('calendar:created', payload)
      } catch (err) { console.error('Socket error in calendar:create:', err) }
    })

    socket.on('calendar:update', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('calendar:updated', payload)
      } catch (err) { console.error('Socket error in calendar:update:', err) }
    })

    socket.on('calendar:delete', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('calendar:deleted', payload)
      } catch (err) { console.error('Socket error in calendar:delete:', err) }
    })
  })
}

module.exports = { registerCalendarSocket }
