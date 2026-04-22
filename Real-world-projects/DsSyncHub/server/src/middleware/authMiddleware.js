const User = require('../models/User')
const { verifyToken } = require('../utils/jwt')

const extractToken = (req) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return req.cookies?.accessToken || null
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req)

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const payload = verifyToken(token)
    const user = await User.findById(payload.sub).select('-passwordHash')

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
      return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' })
    }

    req.user = user
    return next()
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    return next()
  }
}

module.exports = {
  authMiddleware,
  requireRole,
}
