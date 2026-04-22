const crypto = require('crypto')
const Membership = require('../models/Membership')
const Invite = require('../models/Invite')
const Notification = require('../models/Notification')
const User = require('../models/User')
const Workspace = require('../models/Workspace')
const { createActivityLog, createNotification } = require('../utils/collabEvents')
const { enforceMemberLimit, enforceWorkspaceCreateLimit } = require('../services/planLimits')

const ROLE_WEIGHT = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
}

const createSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)

const generateInviteCode = () => crypto.randomBytes(4).toString('hex').toUpperCase()
const generateInviteToken = () => crypto.randomBytes(16).toString('hex')

const ensureUniqueSlug = async (base, excludeWorkspaceId = null) => {
  const slugBase = base || `workspace-${Date.now()}`
  let slug = slugBase
  let suffix = 1

  while (
    await Workspace.exists(
      excludeWorkspaceId ? { slug, _id: { $ne: excludeWorkspaceId } } : { slug },
    )
  ) {
    suffix += 1
    slug = `${slugBase}-${suffix}`
  }

  return slug
}

const ensureUniqueCode = async () => {
  let code = generateInviteCode()
  while (await Workspace.exists({ inviteCode: code })) {
    code = generateInviteCode()
  }
  return code
}

const toWorkspaceCard = (workspace, membership) => ({
  id: workspace._id,
  name: workspace.name,
  slug: workspace.slug,
  description: workspace.description,
  logoUrl: workspace.logoUrl,
  owner: workspace.owner,
  plan: workspace.plan,
  inviteCode: workspace.inviteCode,
  isArchived: workspace.isArchived,
  createdAt: workspace.createdAt,
  updatedAt: workspace.updatedAt,
  role: membership.role,
  status: membership.status,
  lastActive: workspace.updatedAt,
  membersCount: workspace.membersCount || 0,
})

const canManageMembers = (role) => ROLE_WEIGHT[role] >= ROLE_WEIGHT.admin
const canEditWorkspace = (role) => ROLE_WEIGHT[role] >= ROLE_WEIGHT.admin
const isOwner = (role) => role === 'owner'

const getMembershipOr404 = async (userId, workspaceId) => {
  const membership = await Membership.findOne({
    user: userId,
    workspace: workspaceId,
    status: 'active',
  })
  return membership
}

const buildWorkspaceResponse = async (workspace, membership) => ({
  ...workspace.toObject(),
  membersCount: await Membership.countDocuments({
    workspace: workspace._id,
    status: 'active',
  }),
  role: membership.role,
  status: membership.status,
})

const joinWorkspaceRecord = async ({ workspace, user }) => {
  const existingMembership = await Membership.findOne({
    user: user._id,
    workspace: workspace._id,
    status: 'active',
  })

  if (existingMembership) {
    return {
      statusCode: 200,
      message: 'You are already a member of this workspace.',
      workspace: toWorkspaceCard(await buildWorkspaceResponse(workspace, existingMembership), existingMembership),
    }
  }

  const membership = await Membership.findOneAndUpdate(
    { user: user._id, workspace: workspace._id },
    { status: 'active', role: 'member', joinedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  await createActivityLog({
    workspace: workspace._id,
    actor: user._id,
    action: 'member_joined',
    entityType: 'member',
    entityId: membership._id,
    summary: `${user.fullName} joined the workspace.`,
  })

  return {
    statusCode: 200,
    message: 'Joined workspace successfully.',
    workspace: toWorkspaceCard(await buildWorkspaceResponse(workspace, membership), membership),
  }
}

const listWorkspaces = async (req, res, next) => {
  try {
    const memberships = await Membership.find({
      user: req.user._id,
      status: 'active',
    }).populate('workspace')

    const workspaceIds = memberships.map((item) => item.workspace?._id).filter(Boolean)
    const memberCounts = await Membership.aggregate([
      { $match: { workspace: { $in: workspaceIds }, status: 'active' } },
      { $group: { _id: '$workspace', count: { $sum: 1 } } },
    ])
    const countMap = new Map(memberCounts.map((item) => [item._id.toString(), item.count]))

    const workspaces = memberships
      .filter((item) => item.workspace && !item.workspace.isArchived)
      .map((item) =>
        toWorkspaceCard(
          {
            ...item.workspace.toObject(),
            membersCount: countMap.get(item.workspace._id.toString()) || 0,
          },
          item,
        ),
      )

    return res.status(200).json({ success: true, workspaces })
  } catch (error) {
    return next(error)
  }
}

const createWorkspace = async (req, res, next) => {
  try {
    const { name, description = '', logoUrl = '', plan = 'free' } = req.body
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Workspace name is required.' })
    }
    const workspaceLimitCheck = await enforceWorkspaceCreateLimit(req.user._id)
    if (!workspaceLimitCheck.allowed) {
      return res.status(403).json({
        success: false,
        code: workspaceLimitCheck.code,
        message: workspaceLimitCheck.message,
      })
    }

    const slug = await ensureUniqueSlug(createSlug(name))
    const inviteCode = await ensureUniqueCode()

    const workspace = await Workspace.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      logoUrl: logoUrl.trim(),
      owner: req.user._id,
      plan: plan === 'pro' ? 'pro' : 'free',
      inviteCode,
    })

    await Membership.create({
      user: req.user._id,
      workspace: workspace._id,
      role: 'owner',
      invitedBy: req.user._id,
      status: 'active',
    })

    await createActivityLog({
      workspace: workspace._id,
      actor: req.user._id,
      action: 'workspace_created',
      entityType: 'workspace',
      entityId: workspace._id,
      summary: `${req.user.fullName} created workspace "${workspace.name}".`,
    })

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully.',
      workspace: toWorkspaceCard(
        {
          ...workspace.toObject(),
          membersCount: 1,
        },
        { role: 'owner', status: 'active' },
      ),
      activity: { type: 'workspace_created', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const getWorkspaceDetails = async (req, res, next) => {
  try {
    const membership = await getMembershipOr404(req.user._id, req.params.id)
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' })
    }

    const workspace = await Workspace.findById(req.params.id).populate('owner', 'fullName email avatarUrl')
    if (!workspace || workspace.isArchived) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' })
    }
    return res.status(200).json({
      success: true,
      workspace: toWorkspaceCard(
        {
          ...workspace.toObject(),
          membersCount: await Membership.countDocuments({
            workspace: workspace._id,
            status: 'active',
          }),
        },
        membership,
      ),
    })
  } catch (error) {
    return next(error)
  }
}

const updateWorkspace = async (req, res, next) => {
  try {
    const membership = await getMembershipOr404(req.user._id, req.params.id)
    if (!membership || !canEditWorkspace(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const workspace = await Workspace.findById(req.params.id)
    if (!workspace || workspace.isArchived) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' })
    }

    const { name, description, logoUrl, plan } = req.body
    if (typeof name === 'string' && name.trim().length >= 2) {
      workspace.name = name.trim()
      workspace.slug = await ensureUniqueSlug(createSlug(name.trim()), workspace._id)
    }
    if (typeof description === 'string') workspace.description = description.trim()
    if (typeof logoUrl === 'string') workspace.logoUrl = logoUrl.trim()
    const previousPlan = workspace.plan
    if (typeof plan === 'string' && ['free', 'pro'].includes(plan)) workspace.plan = plan

    await workspace.save()
    if (previousPlan !== workspace.plan && workspace.plan === 'pro') {
      await createNotification({
        user: workspace.owner,
        workspace: workspace._id,
        type: 'payment',
        title: 'Plan upgraded',
        message: `Workspace "${workspace.name}" is now on Pro plan.`,
        link: '/billing',
        metadata: { fromPlan: previousPlan, toPlan: workspace.plan },
      })
      await createActivityLog({
        workspace: workspace._id,
        actor: req.user._id,
        action: 'plan_upgraded',
        entityType: 'billing',
        entityId: workspace._id,
        summary: `${req.user.fullName} upgraded billing plan to Pro.`,
      })
    }
    return res.status(200).json({ success: true, workspace: toWorkspaceCard(workspace, membership) })
  } catch (error) {
    return next(error)
  }
}

const archiveWorkspace = async (req, res, next) => {
  try {
    const membership = await getMembershipOr404(req.user._id, req.params.id)
    if (!membership || !isOwner(membership.role)) {
      return res.status(403).json({ success: false, message: 'Only owner can archive workspace.' })
    }

    const workspace = await Workspace.findById(req.params.id)
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' })
    }

    workspace.isArchived = true
    await workspace.save()

    return res.status(200).json({ success: true, message: 'Workspace archived.' })
  } catch (error) {
    return next(error)
  }
}

const joinWorkspace = async (req, res, next) => {
  try {
    const { inviteCode } = req.body
    if (!inviteCode) {
      return res.status(400).json({ success: false, message: 'Invite code is required.' })
    }

    const workspace = await Workspace.findById(req.params.id)
    if (!workspace || workspace.isArchived || workspace.inviteCode !== inviteCode.toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Invalid invite code.' })
    }

    const result = await joinWorkspaceRecord({ workspace, user: req.user })
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      workspace: result.workspace,
    })
  } catch (error) {
    return next(error)
  }
}

const joinWorkspaceByCode = async (req, res, next) => {
  try {
    const inviteCode = String(req.body.inviteCode || '')
      .trim()
      .toUpperCase()

    if (!inviteCode) {
      return res.status(400).json({ success: false, message: 'Invite code is required.' })
    }

    const workspace = await Workspace.findOne({ inviteCode, isArchived: false })
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Invite code was not recognized.' })
    }

    const result = await joinWorkspaceRecord({ workspace, user: req.user })
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      workspace: result.workspace,
    })
  } catch (error) {
    return next(error)
  }
}

const inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' })
    }

    const membership = await getMembershipOr404(req.user._id, req.params.id)
    if (!membership || !canManageMembers(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const workspace = await Workspace.findById(req.params.id)
    if (!workspace || workspace.isArchived) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' })
    }
    const memberLimitCheck = await enforceMemberLimit(workspace._id)
    if (!memberLimitCheck.allowed) {
      return res.status(403).json({
        success: false,
        code: memberLimitCheck.code,
        message: memberLimitCheck.message,
        limits: memberLimitCheck.limits,
        usage: { membersUsed: memberLimitCheck.membersCount },
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    const invite = await Invite.create({
      workspace: workspace._id,
      email: normalizedEmail,
      token: generateInviteToken(),
      role: ['admin', 'member', 'viewer'].includes(role) ? role : 'member',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    if (user) {
      await Membership.findOneAndUpdate(
        { user: user._id, workspace: workspace._id },
        {
          role: invite.role,
          status: 'pending',
          invitedBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
    }

    if (user) {
      await createNotification({
        user: user._id,
        workspace: workspace._id,
        type: 'invite',
        title: 'Workspace invitation',
        message: `${req.user.fullName} invited you to "${workspace.name}".`,
        link: `/workspaces/${workspace._id}`,
        metadata: { inviteId: invite._id, role: invite.role },
      })
    } else {
      await Notification.create({
        user: req.user._id,
        workspace: workspace._id,
        type: 'system',
        title: 'Invite generated',
        message: `Invite link prepared for ${normalizedEmail}.`,
        link: `/workspaces/${workspace._id}`,
        metadata: { inviteId: invite._id },
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Invite prepared successfully.',
      invite: {
        id: invite._id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        expiresAt: invite.expiresAt,
      },
      activity: { type: 'member_invited', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const listMembers = async (req, res, next) => {
  try {
    const requesterMembership = await getMembershipOr404(req.user._id, req.params.id)
    if (!requesterMembership) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' })
    }

    const members = await Membership.find({ workspace: req.params.id })
      .populate('user', 'fullName username email avatarUrl')
      .sort({ joinedAt: 1 })

    return res.status(200).json({
      success: true,
      members: members.map((item) => ({
        id: item._id,
        userId: item.user?._id,
        fullName: item.user?.fullName || 'Invited user',
        username: item.user?.username || '',
        email: item.user?.email || '',
        avatarUrl: item.user?.avatarUrl || '',
        role: item.role,
        status: item.status,
        joinedAt: item.joinedAt,
      })),
    })
  } catch (error) {
    return next(error)
  }
}

const updateMemberRole = async (req, res, next) => {
  try {
    const requesterMembership = await getMembershipOr404(req.user._id, req.params.id)
    if (!requesterMembership || !canManageMembers(requesterMembership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const { role } = req.body
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' })
    }

    const targetMembership = await Membership.findById(req.params.memberId)
    if (!targetMembership || targetMembership.workspace.toString() !== req.params.id) {
      return res.status(404).json({ success: false, message: 'Member not found.' })
    }

    if (targetMembership.role === 'owner') {
      return res.status(400).json({ success: false, message: 'Owner role cannot be changed.' })
    }

    targetMembership.role = role
    await targetMembership.save()

    return res.status(200).json({
      success: true,
      message: 'Member role updated.',
      activity: { type: 'role_changed', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const removeMember = async (req, res, next) => {
  try {
    const requesterMembership = await getMembershipOr404(req.user._id, req.params.id)
    if (!requesterMembership || !canManageMembers(requesterMembership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const targetMembership = await Membership.findById(req.params.memberId)
    if (!targetMembership || targetMembership.workspace.toString() !== req.params.id) {
      return res.status(404).json({ success: false, message: 'Member not found.' })
    }

    if (targetMembership.role === 'owner') {
      return res.status(400).json({ success: false, message: 'Owner cannot be removed.' })
    }

    await targetMembership.deleteOne()
    return res.status(200).json({
      success: true,
      message: 'Member removed from workspace.',
      activity: { type: 'member_removed', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  listWorkspaces,
  createWorkspace,
  getWorkspaceDetails,
  updateWorkspace,
  archiveWorkspace,
  joinWorkspaceByCode,
  joinWorkspace,
  inviteMember,
  listMembers,
  updateMemberRole,
  removeMember,
}
