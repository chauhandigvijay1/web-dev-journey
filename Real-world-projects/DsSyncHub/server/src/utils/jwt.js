const jwt = require('jsonwebtoken')

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in environment variables.')
  }

  return process.env.JWT_SECRET
}

const signAccessToken = (userId, tokenVersion = 0) => {
  return jwt.sign({ sub: userId, tokenVersion }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret())
}

module.exports = {
  signAccessToken,
  verifyToken,
}
