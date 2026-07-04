const User = require('../models/User')
const Workspace = require('../models/Workspace')
const Membership = require('../models/Membership')
const CouponRedemption = require('../models/CouponRedemption')
const Invite = require('../models/Invite')
const Subscription = require('../models/Subscription')
const logger = require('../services/logger')

const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const search = req.query.search || ''

    const query = search
      ? { $or: [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {}

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash -emailVerificationToken -emailVerificationExpiresAt -passwordResetTokenHash -passwordResetExpiresAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(query),
    ])

    return res.status(200).json({ success: true, users, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    return next(error)
  }
}

const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -emailVerificationToken -emailVerificationExpiresAt -passwordResetTokenHash -passwordResetExpiresAt')
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })

    const workspaces = await Membership.find({ user: user._id }).populate('workspace', 'name slug plan')

    return res.status(200).json({ success: true, user, workspaces })
  } catch (error) {
    return next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })

    const userId = user._id
    const Workspace = require('../models/Workspace')
    const Note = require('../models/Note')
    const Task = require('../models/Task')
    const FileAsset = require('../models/FileAsset')
    const Message = require('../models/Message')
    const BillingInvoice = require('../models/BillingInvoice')
    const Notification = require('../models/Notification')
    const AiUsage = require('../models/AiUsage')
    const Invite = require('../models/Invite')

    const ownedWorkspaces = await Workspace.find({ owner: userId })
    const ownedIds = ownedWorkspaces.map((w) => w._id)

    await Promise.all([
      User.findByIdAndDelete(userId),
      Membership.deleteMany({ user: userId }),
      Message.updateMany({ sender: userId }, { deletedAt: new Date() }),
      Note.deleteMany({ createdBy: userId }),
      Task.deleteMany({ createdBy: userId }),
      FileAsset.deleteMany({ uploadedBy: userId }),
      Notification.deleteMany({ user: userId }),
      AiUsage.deleteMany({ user: userId }),
      CouponRedemption.deleteMany({ user: userId }),
      Invite.deleteMany({ workspace: { $in: ownedIds } }),
      Subscription.deleteMany({ user: userId }),
      ...ownedWorkspaces.map((w) =>
        Workspace.findByIdAndDelete(w._id).then(() =>
          Promise.all([
            Membership.deleteMany({ workspace: w._id }),
            Note.deleteMany({ workspace: w._id }),
            Task.deleteMany({ workspace: w._id }),
            Message.deleteMany({ workspace: w._id }),
            FileAsset.deleteMany({ workspace: w._id }),
            BillingInvoice.deleteMany({ workspace: w._id }),
            Subscription.deleteMany({ workspace: w._id }),
            Notification.deleteMany({ workspace: w._id }),
            AiUsage.deleteMany({ workspace: w._id }),
          ]),
        ),
      ),
    ])

    logger.info({ userId: req.params.id, adminId: req.user._id }, 'User deleted by admin')
    return res.status(200).json({ success: true, message: 'User deleted.' })
  } catch (error) {
    return next(error)
  }
}

const listWorkspaces = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const search = req.query.search || ''

    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const [workspaces, total] = await Promise.all([
      Workspace.find(query).populate('owner', 'fullName email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Workspace.countDocuments(query),
    ])

    const workspaceIds = workspaces.map((w) => w._id)
    const memberCounts = await Membership.aggregate([
      { $match: { workspace: { $in: workspaceIds }, status: 'active' } },
      { $group: { _id: '$workspace', count: { $sum: 1 } } },
    ])
    const countMap = new Map(memberCounts.map((m) => [m._id.toString(), m.count]))

    const data = workspaces.map((w) => ({
      ...w.toObject(),
      membersCount: countMap.get(w._id.toString()) || 0,
    }))

    return res.status(200).json({ success: true, workspaces: data, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    return next(error)
  }
}

const getStats = async (req, res, next) => {
  try {
    const [userCount, workspaceCount, inviteCount, proCount] = await Promise.all([
      User.countDocuments(),
      Workspace.countDocuments({ isArchived: false }),
      Invite.countDocuments({ expiresAt: { $gt: new Date() }, usedAt: null }),
      Workspace.countDocuments({ plan: 'pro', isArchived: false }),
    ])

    return res.status(200).json({ success: true, stats: { userCount, workspaceCount, inviteCount, proCount } })
  } catch (error) {
    return next(error)
  }
}

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be user or admin.' })
    }

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })

    user.role = role
    await user.save()

    logger.info({ userId: req.params.id, newRole: role, adminId: req.user._id }, 'User role updated by admin')
    return res.status(200).json({ success: true, message: `User role updated to ${role}.` })
  } catch (error) {
    return next(error)
  }
}

module.exports = { listUsers, getUserDetail, deleteUser, listWorkspaces, getStats, updateUserRole }
