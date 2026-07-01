const Membership = require('../models/Membership')
const { verifyToken } = require('../utils/jwt')

const registerCalendarSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('calendar:create', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        io.to(`workspace:${workspace}`).emit('calendar:created', payload)
      } catch (err) { console.error('Socket error in calendar:create:', err) }
    })

    socket.on('calendar:update', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        io.to(`workspace:${workspace}`).emit('calendar:updated', payload)
      } catch (err) { console.error('Socket error in calendar:update:', err) }
    })

    socket.on('calendar:delete', async (payload) => {
      try {
        const { workspace, eventId } = payload
        if (!workspace || !eventId) return
        io.to(`workspace:${workspace}`).emit('calendar:deleted', payload)
      } catch (err) { console.error('Socket error in calendar:delete:', err) }
    })
  })
}

module.exports = { registerCalendarSocket }
