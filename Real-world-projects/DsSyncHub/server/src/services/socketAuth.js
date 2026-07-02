const User = require('../models/User')
const { verifyToken } = require('../utils/jwt')

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const [key, ...value] = item.split('=')
      if (!key) return acc
      acc[key] = decodeURIComponent(value.join('='))
      return acc
    }, {})

const socketAuthMiddleware = (socket, next) => {
  (async () => {
    try {
      const authToken =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        parseCookies(socket.handshake.headers?.cookie).accessToken

      if (!authToken) return next(new Error('Unauthorized'))

      const payload = verifyToken(authToken)
      const user = await User.findById(payload.sub).select('-passwordHash')
      if (!user || !user.isActive) return next(new Error('Unauthorized'))
      if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) return next(new Error('Unauthorized'))

      socket.user = user
      return next()
    } catch {
      return next(new Error('Unauthorized'))
    }
  })()
}

module.exports = { socketAuthMiddleware }
