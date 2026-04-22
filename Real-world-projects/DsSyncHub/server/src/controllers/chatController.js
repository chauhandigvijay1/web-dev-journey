const Membership = require('../models/Membership')
const Message = require('../models/Message')
const User = require('../models/User')
const { createActivityLog, createNotification } = require('../utils/collabEvents')
const { normalizeAttachments } = require('../services/storageService')

const canWriteMessages = (role) => ['owner', 'admin', 'member'].includes(role)

const getMembership = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active' })

const sanitizeMessage = (value = '') => value.trim().replace(/\s+/g, ' ')
const extractMentionedEmails = (text = '') => {
  const matches = String(text).match(/@([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi) || []
  return [...new Set(matches.map((item) => item.slice(1).toLowerCase()))]
}

const listMessages = async (req, res, next) => {
  try {
    const { workspace, channel } = req.query
    if (!workspace) return res.status(400).json({ success: false, message: 'workspace query is required.' })
    const membership = await getMembership(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const query = { workspace, deletedAt: null }
    if (channel) query.channel = channel
    const messages = await Message.find(query).populate('sender', 'fullName email avatarUrl').sort({ createdAt: 1 }).limit(200)
    return res.status(200).json({ success: true, messages })
  } catch (error) {
    return next(error)
  }
}

const listDirectMessages = async (req, res, next) => {
  try {
    const { workspace } = req.query
    if (!workspace) return res.status(400).json({ success: false, message: 'workspace query is required.' })
    const membership = await getMembership(req.user._id, workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const otherUserId = req.params.userId
    const messages = await Message.find({
      workspace,
      deletedAt: null,
      channel: null,
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id },
      ],
    })
      .populate('sender', 'fullName email avatarUrl')
      .sort({ createdAt: 1 })
      .limit(200)

    return res.status(200).json({ success: true, messages })
  } catch (error) {
    return next(error)
  }
}

const createMessage = async (req, res, next) => {
  try {
    const { workspace, channel = null, recipient = null, content = '', messageType = 'text', attachments = [], replyTo = null, mentions = [] } = req.body
    if (!workspace || (!content && !attachments.length) || (content && !sanitizeMessage(content) && !attachments.length)) {
      return res.status(400).json({ success: false, message: 'workspace and content or attachment are required.' })
    }

    const membership = await getMembership(req.user._id, workspace)
    if (!membership || !canWriteMessages(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const message = await Message.create({
      workspace,
      channel,
      recipient,
      sender: req.user._id,
      content: sanitizeMessage(content || (attachments[0]?.name || 'Shared a file')),
      messageType: attachments.length ? 'file' : messageType,
      attachments: normalizeAttachments(attachments),
      mentions: Array.isArray(mentions) ? mentions : [],
      replyTo,
      seenBy: [req.user._id],
    })

    const populatedMessage = await Message.findById(message._id).populate('sender', 'fullName email avatarUrl')
    await createActivityLog({
      workspace,
      actor: req.user._id,
      action: 'message_sent',
      entityType: 'message',
      entityId: message._id,
      summary: `${req.user.fullName} sent a message.`,
      metadata: { channel, recipient },
    })

    const mentionIdsFromBody = Array.isArray(mentions) ? mentions.map(String) : []
    const mentionedEmails = extractMentionedEmails(content)
    let userIds = mentionIdsFromBody
    if (!userIds.length && mentionedEmails.length) {
      const users = await User.find({ email: { $in: mentionedEmails } }).select('_id email')
      userIds = users.map((item) => String(item._id))
    }
    if (userIds.length) {
      const activeMemberships = await Membership.find({
        workspace,
        status: 'active',
        user: { $in: userIds },
      }).select('user')
      await Promise.all(
        activeMemberships
          .map((item) => item.user?.toString())
          .filter((id) => id && id !== req.user._id.toString())
          .map((userId) =>
            createNotification({
              user: userId,
              workspace,
              type: 'mention',
              title: 'You were mentioned in chat',
              message: `${req.user.fullName} mentioned you in chat.`,
              link: '/chat',
              metadata: { messageId: message._id, channel, recipient },
            }),
          ),
      )
    }
    return res.status(201).json({ success: true, message: populatedMessage })
  } catch (error) {
    return next(error)
  }
}

const editMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message || message.deletedAt) return res.status(404).json({ success: false, message: 'Message not found.' })
    const membership = await getMembership(req.user._id, message.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only sender can edit message.' })
    }

    const { content } = req.body
    if (!content || !sanitizeMessage(content)) {
      return res.status(400).json({ success: false, message: 'content is required.' })
    }
    message.content = sanitizeMessage(content)
    message.editedAt = new Date()
    await message.save()
    const populatedMessage = await Message.findById(message._id).populate('sender', 'fullName email avatarUrl')
    return res.status(200).json({ success: true, message: populatedMessage })
  } catch (error) {
    return next(error)
  }
}

const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message || message.deletedAt) return res.status(404).json({ success: false, message: 'Message not found.' })
    const membership = await getMembership(req.user._id, message.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const isOwner = message.sender.toString() === req.user._id.toString()
    const isModerator = ['owner', 'admin'].includes(membership.role)
    if (!isOwner && !isModerator) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    message.deletedAt = new Date()
    await message.save()
    return res.status(200).json({ success: true, messageId: message._id })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  listMessages,
  listDirectMessages,
  createMessage,
  editMessage,
  deleteMessage,
}
