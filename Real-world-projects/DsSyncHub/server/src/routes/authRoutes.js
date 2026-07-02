const express = require('express')
const rateLimit = require('express-rate-limit')
const {
  getCurrentUser,
  googleAuth,
  loginUser,
  logoutUser,
  requestPasswordReset,
  registerUser,
  resetPassword,
  sendVerificationEmailController,
  verifyEmail,
} = require('../controllers/authController')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
  validateSignup,
} = require('../middleware/validateRequest')

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Try again after 15 minutes.',
  },
})

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Try again after an hour.',
  },
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Try again after 15 minutes.',
  },
})

router.post('/register', authLimiter, validateSignup, registerUser)
router.post('/login', loginLimiter, validateLogin, loginUser)
router.post('/forgot-password', strictLimiter, validateForgotPassword, requestPasswordReset)
router.post('/reset-password', strictLimiter, validateResetPassword, resetPassword)
router.post('/logout', logoutUser)
router.get('/me', authMiddleware, getCurrentUser)
router.post('/google', authLimiter, googleAuth)
router.post('/send-verification', authLimiter, authMiddleware, sendVerificationEmailController)
router.post('/verify-email/:token', strictLimiter, verifyEmail)

module.exports = router
