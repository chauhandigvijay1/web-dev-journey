const AiUsage = require('../models/AiUsage')
const Membership = require('../models/Membership')
const { getPlanLimits } = require('../services/planLimits')

const getDateKey = () => new Date().toISOString().slice(0, 10)

const aiUsageLimit = async (req, res, next) => {
  try {
    const workspaceId = req.body.workspace || req.query.workspace
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspace is required.' })
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      workspace: workspaceId,
      status: 'active',
    })
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a workspace member.' })
    }

    const dateKey = getDateKey()
    const limits = await getPlanLimits(workspaceId)
    const limit = limits.aiDailyLimit

    const usage = await AiUsage.findOneAndUpdate(
      { user: req.user._id, workspace: workspaceId, dateKey },
      { $inc: { count: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    if (usage.count > limit) {
      await AiUsage.updateOne({ _id: usage._id }, { $inc: { count: -1 } })
      return res.status(429).json({
        success: false,
        message: 'Daily AI usage limit reached for current plan.',
        usage: { used: limit, limit },
      })
    }

    req.aiUsage = { used: usage.count, limit, workspace: workspaceId, plan: limits.plan }
    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = { aiUsageLimit }
