const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { getAuthCookieOptions } = require('../utils/cookies')
const { isValidEmail, isValidPhone, isValidUsername, isStrongPassword } = require('../utils/validators')

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

const getProfile = async (req, res) => {
  return res.status(200).json({ success: true, user: toPublicUser(req.user) })
}

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, username, bio, timezone, avatarUrl } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })
    if (typeof fullName === 'string' && fullName.trim().length >= 2) user.fullName = fullName.trim()
    if (typeof username === 'string' && username.trim()) {
      if (!isValidUsername(username)) {
        return res.status(400).json({ success: false, message: 'Username must be 3-30 chars and can include . _ -' })
      }
      user.username = username.trim().toLowerCase()
    }
    if (typeof bio === 'string') user.bio = bio.trim().slice(0, 200)
    if (typeof timezone === 'string') user.timezone = timezone.trim().slice(0, 80)
    if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl.trim()
    await user.save()
    return res.status(200).json({ success: true, user: toPublicUser(user) })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Username is already taken.' })
    }
    return next(error)
  }
}

const updateAccount = async (req, res, next) => {
  try {
    const { email, phone, backupEmail } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })
    if (typeof email === 'string' && email.trim()) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
      }
      user.email = email.trim().toLowerCase()
    }
    if (typeof phone === 'string') {
      const nextPhone = phone.trim()
      if (nextPhone && !isValidPhone(nextPhone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' })
      }
      user.phone = nextPhone || null
    }
    if (typeof backupEmail === 'string') {
      const nextBackupEmail = backupEmail.trim().toLowerCase()
      if (nextBackupEmail && !isValidEmail(nextBackupEmail)) {
        return res.status(400).json({ success: false, message: 'Backup email must be a valid email address.' })
      }
      user.backupEmail = nextBackupEmail
    }
    await user.save()
    return res.status(200).json({ success: true, user: toPublicUser(user) })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email or phone already in use.' })
    }
    return next(error)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Valid current and new password are required.' })
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must include upper, lower, number, and special characters.',
      })
    }
    const user = await User.findById(req.user._id)
    if (!user || !user.passwordHash) {
      return res.status(400).json({ success: false, message: 'Password reset is not available for this account.' })
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'Choose a new password that differs from the current one.' })
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect.' })
    user.passwordHash = await bcrypt.hash(newPassword, 12)
    user.passwordResetTokenHash = null
    user.passwordResetExpiresAt = null
    user.tokenVersion += 1
    await user.save()
    res.clearCookie('accessToken', { ...getAuthCookieOptions(), maxAge: undefined })
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      forceLogout: true,
    })
  } catch (error) {
    return next(error)
  }
}

const updateAppearance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })
    const { theme, accentColor, compactMode } = req.body
    user.appearance = {
      theme: ['light', 'dark', 'system'].includes(theme) ? theme : user.appearance?.theme || 'system',
      accentColor: typeof accentColor === 'string' ? accentColor : user.appearance?.accentColor || 'violet',
      compactMode: typeof compactMode === 'boolean' ? compactMode : Boolean(user.appearance?.compactMode),
    }
    await user.save()
    return res.status(200).json({ success: true, appearance: user.appearance })
  } catch (error) {
    return next(error)
  }
}

const logoutAllSessions = async (_req, res) => {
  const user = await User.findById(_req.user._id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' })
  }

  user.tokenVersion += 1
  await user.save()
  res.clearCookie('accessToken', { ...getAuthCookieOptions(), maxAge: undefined })
  return res.status(200).json({ success: true, message: 'Signed out from all active sessions.' })
}

module.exports = {
  getProfile,
  updateProfile,
  updateAccount,
  changePassword,
  updateAppearance,
  logoutAllSessions,
}
