const crypto = require('crypto')
const Membership = require('../models/Membership')
const Meeting = require('../models/Meeting')
const { createActivityLog } = require('../utils/collabEvents')

const canJoinMeeting = (role) => ['owner', 'admin', 'member', 'viewer'].includes(role)
const canCreateMeeting = (role) => ['owner', 'admin', 'member'].includes(role)

const getMembership = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active' })

const sanitizeRoomId = (value = '') =>
  String(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12)

const createRoomId = () => sanitizeRoomId(crypto.randomBytes(4).toString('hex'))

const serializeMeeting = (meeting) => ({
  id: String(meeting._id),
  workspace: String(meeting.workspace),
  roomId: meeting.roomId,
  title: meeting.title,
  createdBy:
    meeting.createdBy && typeof meeting.createdBy === 'object'
      ? {
          id: String(meeting.createdBy._id),
          fullName: meeting.createdBy.fullName,
          email: meeting.createdBy.email,
          avatarUrl: meeting.createdBy.avatarUrl || '',
        }
      : null,
  scheduledFor: meeting.scheduledFor,
  status: meeting.status,
  participants: Array.isArray(meeting.participants)
    ? meeting.participants.map((participant) => ({
        userId:
          participant.user && typeof participant.user === 'object'
            ? String(participant.user._id)
            : String(participant.user),
        fullName: participant.user?.fullName || 'Participant',
        avatarUrl: participant.user?.avatarUrl || '',
        joinedAt: participant.joinedAt,
      }))
    : [],
  createdAt: meeting.createdAt,
  updatedAt: meeting.updatedAt,
})

const createMeetingRoom = async (req, res, next) => {
  try {
    const { workspace, title = 'Instant Sync', scheduledFor = null } = req.body
    if (!workspace) return res.status(400).json({ success: false, message: 'workspace is required.' })

    const membership = await getMembership(req.user._id, workspace)
    if (!membership || !canCreateMeeting(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const meeting = await Meeting.create({
      workspace,
      roomId: createRoomId(),
      title: String(title || 'Instant Sync').trim().slice(0, 120) || 'Instant Sync',
      createdBy: req.user._id,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      status: scheduledFor ? 'upcoming' : 'live',
      participants: [{ user: req.user._id }],
    })

    await createActivityLog({
      workspace,
      actor: req.user._id,
      action: 'meeting_created',
      entityType: 'meeting',
      entityId: meeting._id,
      summary: `${req.user.fullName} started meeting ${meeting.roomId}.`,
    })

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('participants.user', 'fullName avatarUrl')

    return res.status(201).json({ success: true, meeting: serializeMeeting(populatedMeeting) })
  } catch (error) {
    return next(error)
  }
}

const joinMeetingMetadata = async (req, res, next) => {
  try {
    const roomId = sanitizeRoomId(req.params.roomId)
    if (!roomId) return res.status(400).json({ success: false, message: 'Invalid room code.' })

    const meeting = await Meeting.findOne({ roomId })
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('participants.user', 'fullName avatarUrl')
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting room not found.' })

    const membership = await getMembership(req.user._id, meeting.workspace)
    if (!membership || !canJoinMeeting(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const alreadyJoined = meeting.participants.some(
      (participant) =>
        String(participant.user?._id || participant.user) === req.user._id.toString(),
    )

    if (!alreadyJoined) {
      meeting.participants.push({ user: req.user._id })
      if (meeting.status === 'upcoming') {
        meeting.status = 'live'
      }
      await meeting.save()
    }

    const refreshedMeeting = await Meeting.findById(meeting._id)
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('participants.user', 'fullName avatarUrl')

    return res.status(200).json({ success: true, meeting: serializeMeeting(refreshedMeeting) })
  } catch (error) {
    return next(error)
  }
}

const listUpcomingMeetings = async (req, res, next) => {
  try {
    const workspaceId = req.query.workspace
    if (!workspaceId) return res.status(400).json({ success: false, message: 'workspace query is required.' })

    const membership = await getMembership(req.user._id, workspaceId)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const meetings = await Meeting.find({
      workspace: workspaceId,
      status: { $in: ['upcoming', 'live'] },
    })
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('participants.user', 'fullName avatarUrl')
      .sort({ scheduledFor: 1, createdAt: -1 })
      .limit(12)

    return res.status(200).json({ success: true, meetings: meetings.map(serializeMeeting) })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createMeetingRoom,
  joinMeetingMetadata,
  listUpcomingMeetings,
  sanitizeRoomId,
  serializeMeeting,
}
