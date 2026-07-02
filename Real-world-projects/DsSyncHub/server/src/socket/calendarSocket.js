const Membership = require('../models/Membership')
const logger = require('../services/logger')
const { socketAuthMiddleware } = require('../services/socketAuth')

const registerCalendarSocket = (io) => {
  io.use(socketAuthMiddleware)

  io.on('connection', (socket) => {
    socket.on('calendar:create', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('calendar:created', payload)
      } catch (err) { logger.error({ err, event: 'calendar:create' }, 'Socket error in calendar:create') }
    })

    socket.on('calendar:update', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('calendar:updated', payload)
      } catch (err) { logger.error({ err, event: 'calendar:update' }, 'Socket error in calendar:update') }
    })

    socket.on('calendar:delete', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('calendar:deleted', payload)
      } catch (err) { logger.error({ err, event: 'calendar:delete' }, 'Socket error in calendar:delete') }
    })

    socket.on('disconnect', () => {
      try {
        const workspaceId = socket.data.workspaceId
        if (!workspaceId) return
        socket.leave(`workspace:${workspaceId}`)
      } catch (err) { logger.error({ err, event: 'calendar:disconnect' }, 'Socket error in disconnect') }
    })
  })
}

module.exports = { registerCalendarSocket }
