const Membership = require('../models/Membership')
const logger = require('../services/logger')
const { socketAuthMiddleware } = require('../services/socketAuth')

const registerNoteSocket = (io) => {
  io.use(socketAuthMiddleware)

  io.on('connection', (socket) => {
    socket.on('note:create', async (payload) => {
      try {
        const { workspace, noteId } = payload
        if (!workspace || !noteId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('note:created', payload)
      } catch (err) { logger.error({ err, event: 'note:create' }, 'Socket error in note:create') }
    })

    socket.on('note:update', async (payload) => {
      try {
        const { workspace, noteId } = payload
        if (!workspace || !noteId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('note:updated', payload)
      } catch (err) { logger.error({ err, event: 'note:update' }, 'Socket error in note:update') }
    })

    socket.on('note:delete', async (payload) => {
      try {
        const { workspace, noteId } = payload
        if (!workspace || !noteId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('note:deleted', payload)
      } catch (err) { logger.error({ err, event: 'note:delete' }, 'Socket error in note:delete') }
    })

    socket.on('disconnect', () => {
      try {
        const workspaceId = socket.data.workspaceId
        if (!workspaceId) return
        socket.leave(`workspace:${workspaceId}`)
      } catch (err) { logger.error({ err, event: 'note:disconnect' }, 'Socket error in disconnect') }
    })
  })
}

module.exports = { registerNoteSocket }
