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

const registerTaskSocket = (io) => {
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
    socket.on('task:create', async (payload) => {
      try {
        const { workspace, title } = payload
        if (!workspace || !title) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('task:created', payload)
      } catch (err) { console.error('Socket error in task:create:', err) }
    })

    socket.on('task:update', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('task:updated', payload)
      } catch (err) { console.error('Socket error in task:update:', err) }
    })

    socket.on('task:move', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('task:moved', payload)
      } catch (err) { console.error('Socket error in task:move:', err) }
    })

    socket.on('task:delete', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('task:deleted', payload)
      } catch (err) { console.error('Socket error in task:delete:', err) }
    })
  })
}

module.exports = { registerTaskSocket }
