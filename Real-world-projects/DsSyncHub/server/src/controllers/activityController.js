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

    const activity = await ActivityLog.find({ workspace: workspaceId })
      .populate('actor', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(150)

    return res.status(200).json({
      success: true,
      activity: activity.map(toActivity),
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { listWorkspaceActivity }
