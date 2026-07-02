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
      try {
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
      } catch (err) { console.error('Socket error in join_workspace:', err) }
    })

    socket.on('join_channel', async ({ workspaceId, channelId }) => {
      try {
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
      } catch (err) { console.error('Socket error in join_channel:', err) }
    })

    socket.on('leave_channel', ({ channelId }) => {
      try {
        if (!channelId) return
        socket.leave(`channel:${channelId}`)
      } catch (err) { console.error('Socket error in leave_channel:', err) }
    })

    socket.on('send_message', async (payload) => {
      try {
        const { workspace, channel = null } = payload || {}
        if (!workspace || !channel) return
        socket.to(`channel:${channel}`).emit('message_received', payload)
      } catch (err) { console.error('Socket error in send_message:', err) }
    })

    socket.on('typing_start', async ({ workspaceId, channelId }) => {
      try {
        if (!workspaceId) return
        const membership = await Membership.findOne({
          user: socket.user._id,
          workspace: workspaceId,
          status: 'active',
        })
        if (!membership) return
        socket.broadcast.to(channelId ? `channel:${channelId}` : `workspace:${workspaceId}`).emit('user_typing', {
          workspaceId,
          channelId: channelId || null,
          userId: socket.user._id.toString(),
          fullName: socket.user.fullName,
        })
      } catch (err) { console.error('Socket error in typing_start:', err) }
    })

    socket.on('typing_stop', async ({ workspaceId, channelId }) => {
      try {
        if (!workspaceId) return
        const membership = await Membership.findOne({
          user: socket.user._id,
          workspace: workspaceId,
          status: 'active',
        })
        if (!membership) return
        socket.broadcast
          .to(channelId ? `channel:${channelId}` : `workspace:${workspaceId}`)
          .emit('typing_stopped', {
            workspaceId,
            channelId: channelId || null,
            userId: socket.user._id.toString(),
          })
      } catch (err) { console.error('Socket error in typing_stop:', err) }
    })

    socket.on('mark_seen', async ({ messageIds = [], workspaceId }) => {
      try {
        if (!workspaceId || !Array.isArray(messageIds) || !messageIds.length) return
        const membership = await Membership.findOne({
          user: socket.user._id,
          workspace: workspaceId,
          status: 'active',
        })
        if (!membership) return
        await Message.updateMany(
          { _id: { $in: messageIds }, workspace: workspaceId },
          { $addToSet: { seenBy: socket.user._id } },
        )
        io.to(`workspace:${workspaceId}`).emit('messages_seen', {
          messageIds,
          userId: socket.user._id.toString(),
        })
      } catch (err) { console.error('Socket error in mark_seen:', err) }
    })

    socket.on('edit_message', async ({ messageId, content }) => {
      try {
        if (!messageId || !content || !String(content).trim()) return
        const message = await Message.findById(messageId)
        if (!message || message.sender.toString() !== socket.user._id.toString()) return
        const membership = await Membership.findOne({
          user: socket.user._id,
          workspace: message.workspace,
          status: 'active',
        })
        if (!membership) return
        message.content = String(content).trim()
        message.editedAt = new Date()
        await message.save()
        io.to(`workspace:${message.workspace}`).emit('message_updated', {
          messageId: message._id.toString(),
          content: message.content,
          editedAt: message.editedAt,
        })
      } catch (err) { console.error('Socket error in edit_message:', err) }
    })

    socket.on('delete_message', async ({ messageId }) => {
      try {
        if (!messageId) return
        const message = await Message.findById(messageId)
        if (!message || message.sender.toString() !== socket.user._id.toString()) return
        const membership = await Membership.findOne({
          user: socket.user._id,
          workspace: message.workspace,
          status: 'active',
        })
        if (!membership) return
        message.deletedAt = new Date()
        await message.save()
        io.to(`workspace:${message.workspace}`).emit('message_deleted', {
          messageId: message._id.toString(),
        })
      } catch (err) { console.error('Socket error in delete_message:', err) }
    })

    socket.on('add_reaction', async ({ messageId, emoji }) => {
      try {
        if (!messageId || !emoji) return
        const message = await Message.findById(messageId)
        if (!message || message.deletedAt) return
        const membership = await Membership.findOne({
          user: socket.user._id,
          workspace: message.workspace,
          status: 'active',
        })
        if (!membership) return

        const existingReaction = message.reactions.find((r) => r.emoji === emoji)
        if (existingReaction) {
          const userIndex = existingReaction.users.indexOf(socket.user._id)
          if (userIndex > -1) {
            existingReaction.users.splice(userIndex, 1)
            if (existingReaction.users.length === 0) {
              message.reactions.pull({ _id: existingReaction._id })
            }
          } else {
            existingReaction.users.push(socket.user._id)
          }
        } else {
          message.reactions.push({ emoji, users: [socket.user._id] })
        }
        await message.save()
        const populated = await Message.findById(message._id).populate('sender', 'fullName email avatarUrl').populate({ path: 'replyTo', select: 'content sender', populate: { path: 'sender', select: 'fullName' } })
        io.to(`workspace:${message.workspace}`).emit('message_reaction', {
          message: populated,
        })
      } catch (err) { console.error('Socket error in add_reaction:', err) }
    })

    socket.on('disconnect', () => {
      try {
        const workspaceId = socket.data.workspaceId
        if (!workspaceId || !workspaceOnlineUsers.has(workspaceId)) return
        const users = workspaceOnlineUsers.get(workspaceId)
        users.delete(socket.user._id.toString())
        io.to(`workspace:${workspaceId}`).emit('online_users', {
          workspaceId,
          users: Array.from(users.values()),
        })
      } catch (err) { console.error('Socket error in disconnect:', err) }
    })
  })
}

module.exports = { registerChatSocket }
