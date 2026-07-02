const ActivityLog = require('../models/ActivityLog')
const Membership = require('../models/Membership')

const toActivity = (item) => ({
  id: item._id,
  workspace: item.workspace,
  actor: item.actor
    ? {
        id: item.actor._id,
        fullName: item.actor.fullName,
        email: item.actor.email,
        avatarUrl: item.actor.avatarUrl || '',
      }
    : null,
  action: item.action,
  entityType: item.entityType,
  entityId: item.entityId,
  summary: item.summary,
  metadata: item.metadata || null,
  createdAt: item.createdAt,
})

const listWorkspaceActivity = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(150, Math.max(1, parseInt(req.query.limit, 10) || 50))
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspace query is required.' })
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      workspace: workspaceId,
      status: 'active',
    })
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a workspace member.' })
    }

    const total = await ActivityLog.countDocuments({ workspace: workspaceId })
    const activity = await ActivityLog.find({ workspace: workspaceId })
      .populate('actor', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return res.status(200).json({
      success: true,
      activity: activity.map(toActivity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { listWorkspaceActivity }
