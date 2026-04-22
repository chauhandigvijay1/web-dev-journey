const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const { sendPasswordResetEmail } = require('../services/emailService')
const { getAuthCookieOptions } = require('../utils/cookies')
const { signAccessToken } = require('../utils/jwt')
const { isStrongPassword, isValidEmail, isValidPhone } = require('../utils/validators')

const toPublicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  phone: user.phone,
  role: user.role,
  provider: user.provider,
  avatarUrl: user.avatarUrl,
  emailVerified: user.emailVerified,
  bio: user.bio || '',
  timezone: user.timezone || 'UTC',
  backupEmail: user.backupEmail || '',
  appearance: user.appearance || { theme: 'system', accentColor: 'violet', compactMode: false },
})

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const registerUser = async (req, res, next) => {
  try {
    const { fullName, username, email, phone, password } = req.body
    const normalizedEmail = email.toLowerCase()
    const normalizedUsername = username.toLowerCase()

    const duplicateQuery = [{ email: normalizedEmail }, { username: normalizedUsername }]
    if (phone) duplicateQuery.push({ phone })

    const existingUser = await User.findOne({ $or: duplicateQuery })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with these details already exists.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      fullName,
      username: normalizedUsername,
      email: normalizedEmail,
      phone: phone || null,
      passwordHash,
      provider: 'local',
      emailVerified: false,
      lastLoginAt: new Date(),
    })

    const accessToken = signAccessToken(user._id.toString(), user.tokenVersion)
    res.cookie('accessToken', accessToken, getAuthCookieOptions())

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: toPublicUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { identifier, password, rememberMe } = req.body
    const normalized = identifier.trim().toLowerCase()

    const query = isValidEmail(normalized)
      ? { email: normalized }
      : isValidPhone(normalized)
        ? { phone: normalized }
        : { username: normalized }

    const user = await User.findOne(query)
    if (!user || !user.passwordHash || user.provider !== 'local') {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is disabled.' })
    }

    user.lastLoginAt = new Date()
    await user.save()

    const accessToken = signAccessToken(user._id.toString(), user.tokenVersion)
    res.cookie('accessToken', accessToken, getAuthCookieOptions(rememberMe !== false))

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: toPublicUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

const requestPasswordReset = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
    }

    const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt')
    const responseBody = {
      success: true,
      message: 'If an account exists, a reset link has been prepared.',
    }

    if (user && user.provider === 'local' && user.passwordHash) {
      const token = crypto.randomBytes(24).toString('hex')
      user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex')
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await user.save()

      const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
      const resetUrl = `${clientUrl}/reset-password/${token}`
      await sendPasswordResetEmail({ toEmail: user.email, resetUrl })
    }

    return res.status(200).json(responseBody)
  } catch (error) {
    return next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'A valid reset token is required.' })
    }
    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include upper, lower, number, and special characters.',
      })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' })
    }

    const passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      passwordResetTokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt')

    if (!user || user.provider !== 'local') {
      return res.status(400).json({ success: false, message: 'The reset link is invalid or has expired.' })
    }

    user.passwordHash = await bcrypt.hash(password, 12)
    user.passwordResetTokenHash = null
    user.passwordResetExpiresAt = null
    user.tokenVersion += 1
    await user.save()

    res.clearCookie('accessToken', { ...getAuthCookieOptions(), maxAge: undefined })
    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please sign in with your new password.',
    })
  } catch (error) {
    return next(error)
  }
}

const logoutUser = async (_req, res) => {
  res.clearCookie('accessToken', { ...getAuthCookieOptions(), maxAge: undefined })
  return res.status(200).json({ success: true, message: 'Logged out successfully.' })
}

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: toPublicUser(req.user),
  })
}

const googleAuth = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Google auth is not configured on server.',
      })
    }

    const { idToken } = req.body
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Google idToken is required.',
      })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload?.email || !payload?.sub) {
      return res.status(400).json({ success: false, message: 'Invalid Google token payload.' })
    }

    const normalizedEmail = payload.email.toLowerCase()
    let user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      const generatedUsername = normalizedEmail.split('@')[0].replace(/[^a-z0-9._-]/gi, '')
      user = await User.create({
        fullName: payload.name || 'Google User',
        username: `${generatedUsername}_${Math.floor(Math.random() * 10000)}`,
        email: normalizedEmail,
        provider: 'google',
        emailVerified: true,
        avatarUrl: payload.picture || '',
      })
    } else {
      // Keep existing provider for local accounts, but allow Google sign-in by verified email.
      if (user.provider !== 'local') {
        user.provider = 'google'
      }
      user.emailVerified = true
      if (payload.picture && !user.avatarUrl) {
        user.avatarUrl = payload.picture
      }
    }

    user.lastLoginAt = new Date()
    await user.save()

    const accessToken = signAccessToken(user._id.toString(), user.tokenVersion)
    res.cookie('accessToken', accessToken, getAuthCookieOptions())

    return res.status(200).json({
      success: true,
      message: 'Google auth successful.',
      user: toPublicUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  logoutUser,
  getCurrentUser,
  googleAuth,
}
