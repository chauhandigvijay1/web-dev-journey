const Membership = require('../models/Membership')
const Task = require('../models/Task')
const { verifyToken } = require('../utils/jwt')

const registerTaskSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('task:create', async (payload) => {
      try {
        const { workspace, title } = payload
        if (!workspace || !title) return
        io.to(`workspace:${workspace}`).emit('task:created', payload)
      } catch (err) { console.error('Socket error in task:create:', err) }
    })

    socket.on('task:update', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        io.to(`workspace:${workspace}`).emit('task:updated', payload)
      } catch (err) { console.error('Socket error in task:update:', err) }
    })

    socket.on('task:move', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        io.to(`workspace:${workspace}`).emit('task:moved', payload)
      } catch (err) { console.error('Socket error in task:move:', err) }
    })

    socket.on('task:delete', async (payload) => {
      try {
        const { workspace, taskId } = payload
        if (!workspace || !taskId) return
        io.to(`workspace:${workspace}`).emit('task:deleted', payload)
      } catch (err) { console.error('Socket error in task:delete:', err) }
    })
  })
}

module.exports = { registerTaskSocket }
