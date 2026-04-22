const ActivityLog = require('../models/ActivityLog')
const Notification = require('../models/Notification')

const safeLink = (value = '') => {
  if (typeof value !== 'string') return ''
  if (!value.startsWith('/')) return ''
  return value.slice(0, 300)
}

const createNotification = async (payload) => {
  if (!payload?.user || !payload?.type || !payload?.title || !payload?.message) return null
  return Notification.create({
    user: payload.user,
    workspace: payload.workspace || null,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    link: safeLink(payload.link),
    metadata: payload.metadata || null,
  })
}

const createActivityLog = async (payload) => {
  if (!payload?.workspace || !payload?.actor || !payload?.action || !payload?.entityType || !payload?.summary) {
    return null
  }
  return ActivityLog.create({
    workspace: payload.workspace,
    actor: payload.actor,
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId || null,
    summary: payload.summary,
    metadata: payload.metadata || null,
  })
}

module.exports = {
  createNotification,
  createActivityLog,
}
