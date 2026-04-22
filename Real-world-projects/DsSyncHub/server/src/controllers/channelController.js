const Channel = require('../models/Channel')
const Membership = require('../models/Membership')

const canManageChannels = (role) => ['owner', 'admin', 'member'].includes(role)

const getMembership = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active' })

const listChannels = async (req, res, next) => {
  try {
    const { workspace } = req.query
    if (!workspace) {
      return res.status(400).json({ success: false, message: 'workspace query is required.' })
    }

    const membership = await getMembership(req.user._id, workspace)
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a workspace member.' })
    }

    const channels = await Channel.find({ workspace }).sort({ name: 1 })
    return res.status(200).json({ success: true, channels })
  } catch (error) {
    return next(error)
  }
}

const createChannel = async (req, res, next) => {
  try {
    const { workspace, name, description = '', isPrivate = false } = req.body
    if (!workspace || !name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'workspace and name are required.' })
    }

    const membership = await getMembership(req.user._id, workspace)
    if (!membership || !canManageChannels(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    let slug = baseSlug || `channel-${Date.now()}`
    let suffix = 1
    while (await Channel.exists({ workspace, slug })) {
      suffix += 1
      slug = `${baseSlug}-${suffix}`
    }

    const channel = await Channel.create({
      workspace,
      name: name.trim(),
      slug,
      description: description.trim(),
      isPrivate: Boolean(isPrivate),
      createdBy: req.user._id,
    })
    return res.status(201).json({ success: true, channel })
  } catch (error) {
    return next(error)
  }
}

const updateChannel = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id)
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found.' })

    const membership = await getMembership(req.user._id, channel.workspace)
    if (!membership || !canManageChannels(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const { name, description, isPrivate } = req.body
    if (typeof name === 'string' && name.trim().length >= 2) channel.name = name.trim()
    if (typeof description === 'string') channel.description = description.trim()
    if (typeof isPrivate === 'boolean') channel.isPrivate = isPrivate
    await channel.save()
    return res.status(200).json({ success: true, channel })
  } catch (error) {
    return next(error)
  }
}

const deleteChannel = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id)
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found.' })
    const membership = await getMembership(req.user._id, channel.workspace)
    if (!membership || !canManageChannels(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }
    await channel.deleteOne()
    return res.status(200).json({ success: true, message: 'Channel deleted.' })
  } catch (error) {
    return next(error)
  }
}

module.exports = { listChannels, createChannel, updateChannel, deleteChannel }
