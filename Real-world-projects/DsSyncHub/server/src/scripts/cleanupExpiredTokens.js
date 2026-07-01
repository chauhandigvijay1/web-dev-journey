const Invite = require('../models/Invite')
const User = require('../models/User')
const logger = require('../services/logger')

const cleanupExpiredTokens = async () => {
  try {
    const now = new Date()

    const [inviteResult, passwordResult, verifyResult] = await Promise.all([
      Invite.deleteMany({ expiresAt: { $lt: now }, acceptedAt: null }),
      User.updateMany(
        { passwordResetExpiresAt: { $lt: now }, passwordResetTokenHash: { $ne: null } },
        { $set: { passwordResetTokenHash: null, passwordResetExpiresAt: null } },
      ),
      User.updateMany(
        { emailVerificationExpiresAt: { $lt: now }, emailVerificationToken: { $ne: null } },
        { $set: { emailVerificationToken: null, emailVerificationExpiresAt: null } },
      ),
    ])

    if (inviteResult.deletedCount || passwordResult.modifiedCount || verifyResult.modifiedCount) {
      logger.info({
        expiredInvites: inviteResult.deletedCount,
        expiredPasswordTokens: passwordResult.modifiedCount,
        expiredVerifyTokens: verifyResult.modifiedCount,
      }, 'Expired tokens cleaned up')
    }
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to clean up expired tokens')
  }
}

module.exports = { cleanupExpiredTokens }
