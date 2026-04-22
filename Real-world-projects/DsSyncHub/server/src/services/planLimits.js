const Membership = require('../models/Membership')
const Subscription = require('../models/Subscription')
const Workspace = require('../models/Workspace')

const PLANS = {
  free: {
    workspaceLimit: 1,
    memberLimit: 3,
    aiDailyLimit: 10,
    storageLimitMb: 512,
  },
  pro_monthly: {
    workspaceLimit: Number.POSITIVE_INFINITY,
    memberLimit: Number.POSITIVE_INFINITY,
    aiDailyLimit: 300,
    storageLimitMb: 10240,
  },
  pro_yearly: {
    workspaceLimit: Number.POSITIVE_INFINITY,
    memberLimit: Number.POSITIVE_INFINITY,
    aiDailyLimit: 500,
    storageLimitMb: 25600,
  },
}

const getWorkspaceSubscription = async (workspaceId) => {
  const subscription = await Subscription.findOne({ workspace: workspaceId }).sort({ createdAt: -1 })
  if (subscription && ['active', 'trialing', 'pending'].includes(subscription.status)) {
    return subscription
  }
  return {
    plan: 'free',
    status: 'active',
  }
}

const getPlanLimits = async (workspaceId) => {
  const subscription = await getWorkspaceSubscription(workspaceId)
  const planKey = subscription.plan in PLANS ? subscription.plan : 'free'
  return {
    plan: planKey,
    status: subscription.status,
    ...PLANS[planKey],
  }
}

const enforceWorkspaceCreateLimit = async (userId) => {
  const ownedWorkspaces = await Workspace.find({ owner: userId, isArchived: false }).select('_id')
  const ownedWorkspaceCount = ownedWorkspaces.length
  const ownedWorkspaceIds = ownedWorkspaces.map((item) => item._id)
  const activeProSubscription = await Subscription.findOne({
    workspace: { $in: ownedWorkspaceIds },
    plan: { $in: ['pro_monthly', 'pro_yearly'] },
    status: { $in: ['active', 'trialing', 'pending'] },
  })
  if (!activeProSubscription && ownedWorkspaceCount >= PLANS.free.workspaceLimit) {
    return {
      allowed: false,
      code: 'workspace_limit_exceeded',
      message: 'Free plan allows only 1 workspace. Upgrade to Pro for unlimited workspaces.',
    }
  }
  return { allowed: true }
}

const enforceMemberLimit = async (workspaceId) => {
  const limits = await getPlanLimits(workspaceId)
  const membersCount = await Membership.countDocuments({ workspace: workspaceId, status: 'active' })
  if (membersCount >= limits.memberLimit) {
    return {
      allowed: false,
      code: 'member_limit_exceeded',
      message: 'Member limit reached for current plan. Upgrade to Pro to invite more members.',
      limits,
      membersCount,
    }
  }
  return { allowed: true, limits, membersCount }
}

module.exports = {
  getPlanLimits,
  getWorkspaceSubscription,
  enforceWorkspaceCreateLimit,
  enforceMemberLimit,
}
