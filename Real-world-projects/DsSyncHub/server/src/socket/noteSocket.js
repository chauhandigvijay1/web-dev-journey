const Membership = require('../models/Membership')
const { verifyToken } = require('../utils/jwt')

const registerNoteSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('note:create', async (payload) => {
      try {
        const { workspace, noteId } = payload
        if (!workspace || !noteId) return
        io.to(`workspace:${workspace}`).emit('note:created', payload)
      } catch (err) { console.error('Socket error in note:create:', err) }
    })

    socket.on('note:update', async (payload) => {
      try {
        const { workspace, noteId } = payload
        if (!workspace || !noteId) return
        io.to(`workspace:${workspace}`).emit('note:updated', payload)
      } catch (err) { console.error('Socket error in note:update:', err) }
    })

    socket.on('note:delete', async (payload) => {
      try {
        const { workspace, noteId } = payload
        if (!workspace || !noteId) return
        io.to(`workspace:${workspace}`).emit('note:deleted', payload)
      } catch (err) { console.error('Socket error in note:delete:', err) }
    })
  })
}

module.exports = { registerNoteSocket }
