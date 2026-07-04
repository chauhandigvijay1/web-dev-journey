const Membership = require('../models/Membership')
const logger = require('../services/logger')

const registerTaskSocket = (io) => {

  io.on('connection', (socket) => {
    socket.on('task:create', async (payload) => {
      try {
        const { workspace, title } = payload
        if (!workspace || !title) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('task:created', payload)
      } catch (err) { logger.error({ err, event: 'task:create' }, 'Socket error in task:create') }
    })

    socket.on('task:update', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('task:updated', payload)
      } catch (err) { logger.error({ err, event: 'task:update' }, 'Socket error in task:update') }
    })

    socket.on('task:move', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('task:moved', payload)
      } catch (err) { logger.error({ err, event: 'task:move' }, 'Socket error in task:move') }
    })

    socket.on('task:delete', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        const membership = await Membership.findOne({ user: socket.user._id, workspace, status: 'active' })
        if (!membership) return
        io.to(`workspace:${workspace}`).emit('task:deleted', payload)
      } catch (err) { logger.error({ err, event: 'task:delete' }, 'Socket error in task:delete') }
    })

    socket.on('disconnect', () => {
      try {
        const workspaceId = socket.data.workspaceId
        if (!workspaceId) return
        socket.leave(`workspace:${workspaceId}`)
      } catch (err) { logger.error({ err, event: 'task:disconnect' }, 'Socket error in disconnect') }
    })
  })
}

module.exports = { registerTaskSocket }
