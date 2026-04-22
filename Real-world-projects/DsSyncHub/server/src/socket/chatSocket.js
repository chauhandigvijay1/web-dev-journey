const Channel = require('../models/Channel')
const Membership = require('../models/Membership')
const Message = require('../models/Message')
const User = require('../models/User')
const { verifyToken } = require('../utils/jwt')

const workspaceOnlineUsers = new Map()

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

const registerChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const authToken =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        parseCookies(socket.handshake.headers?.cookie).accessToken

      if (!authToken) {
        return next(new Error('Unauthorized'))
      }

      const payload = verifyToken(authToken)
      const user = await User.findById(payload.sub).select('-passwordHash')
      if (!user || !user.isActive) {
        return next(new Error('Unauthorized'))
      }
      if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
        return next(new Error('Unauthorized'))
      }

      socket.user = user
      return next()
    } catch (_error) {
      return next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('join_workspace', async ({ workspaceId }) => {
      if (!workspaceId) return
      const membership = await Membership.findOne({
        user: socket.user._id,
        workspace: workspaceId,
        status: 'active',
      })
      if (!membership) return

      socket.join(`workspace:${workspaceId}`)
      socket.data.workspaceId = workspaceId

      if (!workspaceOnlineUsers.has(workspaceId)) {
        workspaceOnlineUsers.set(workspaceId, new Map())
      }
      workspaceOnlineUsers.get(workspaceId).set(socket.user._id.toString(), {
        userId: socket.user._id.toString(),
        fullName: socket.user.fullName,
        avatarUrl: socket.user.avatarUrl || '',
        lastSeenAt: new Date().toISOString(),
      })

      io.to(`workspace:${workspaceId}`).emit('online_users', {
        workspaceId,
        users: Array.from(workspaceOnlineUsers.get(workspaceId).values()),
      })
    })

    socket.on('join_channel', async ({ workspaceId, channelId }) => {
      if (!workspaceId || !channelId) return
      const membership = await Membership.findOne({
        user: socket.user._id,
        workspace: workspaceId,
        status: 'active',
      })
      if (!membership) return
      const channel = await Channel.findById(channelId)
      if (!channel || channel.workspace.toString() !== workspaceId) return
      socket.join(`channel:${channelId}`)
    })

    socket.on('leave_channel', ({ channelId }) => {
      if (!channelId) return
      socket.leave(`channel:${channelId}`)
    })

    socket.on('send_message', async (payload) => {
      const { workspace, channel = null, recipient = null, content, messageType = 'text', attachments = [] } = payload || {}
      if (!workspace || !content || !String(content).trim()) return
      const membership = await Membership.findOne({
        user: socket.user._id,
        workspace,
        status: 'active',
      })
      if (!membership || !['owner', 'admin', 'member'].includes(membership.role)) return

      const message = await Message.create({
        workspace,
        channel,
        recipient,
        sender: socket.user._id,
        content: String(content).trim(),
        messageType,
        attachments,
        seenBy: [socket.user._id],
      })
      const populated = await Message.findById(message._id).populate('sender', 'fullName email avatarUrl')

      if (channel) {
        io.to(`channel:${channel}`).emit('message_received', populated)
      } else {
        io.to(`workspace:${workspace}`).emit('message_received', populated)
      }
    })

    socket.on('typing_start', ({ workspaceId, channelId }) => {
      if (!workspaceId) return
      socket.broadcast.to(channelId ? `channel:${channelId}` : `workspace:${workspaceId}`).emit('user_typing', {
        workspaceId,
        channelId: channelId || null,
        userId: socket.user._id.toString(),
        fullName: socket.user.fullName,
      })
    })

    socket.on('typing_stop', ({ workspaceId, channelId }) => {
      if (!workspaceId) return
      socket.broadcast
        .to(channelId ? `channel:${channelId}` : `workspace:${workspaceId}`)
        .emit('typing_stopped', {
          workspaceId,
          channelId: channelId || null,
          userId: socket.user._id.toString(),
        })
    })

    socket.on('mark_seen', async ({ messageIds = [], workspaceId }) => {
      if (!workspaceId || !Array.isArray(messageIds) || !messageIds.length) return
      await Message.updateMany(
        { _id: { $in: messageIds }, workspace: workspaceId },
        { $addToSet: { seenBy: socket.user._id } },
      )
      io.to(`workspace:${workspaceId}`).emit('messages_seen', {
        messageIds,
        userId: socket.user._id.toString(),
      })
    })

    socket.on('edit_message', async ({ messageId, content }) => {
      if (!messageId || !content || !String(content).trim()) return
      const message = await Message.findById(messageId)
      if (!message || message.sender.toString() !== socket.user._id.toString()) return
      message.content = String(content).trim()
      message.editedAt = new Date()
      await message.save()
      io.to(`workspace:${message.workspace}`).emit('message_updated', {
        messageId: message._id.toString(),
        content: message.content,
        editedAt: message.editedAt,
      })
    })

    socket.on('delete_message', async ({ messageId }) => {
      if (!messageId) return
      const message = await Message.findById(messageId)
      if (!message || message.sender.toString() !== socket.user._id.toString()) return
      message.deletedAt = new Date()
      await message.save()
      io.to(`workspace:${message.workspace}`).emit('message_deleted', {
        messageId: message._id.toString(),
      })
    })

    socket.on('disconnect', () => {
      const workspaceId = socket.data.workspaceId
      if (!workspaceId || !workspaceOnlineUsers.has(workspaceId)) return
      const users = workspaceOnlineUsers.get(workspaceId)
      users.delete(socket.user._id.toString())
      io.to(`workspace:${workspaceId}`).emit('online_users', {
        workspaceId,
        users: Array.from(users.values()),
      })
    })
  })
}

module.exports = { registerChatSocket }
