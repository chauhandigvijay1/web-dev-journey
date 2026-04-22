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
} = require('../controllers/authController')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
  validateSignup,
} = require('../middleware/validateRequest')

const router = express.Router()

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

router.post('/register', validateSignup, registerUser)
router.post('/login', loginLimiter, validateLogin, loginUser)
router.post('/forgot-password', validateForgotPassword, requestPasswordReset)
router.post('/reset-password', validateResetPassword, resetPassword)
router.post('/logout', logoutUser)
router.get('/me', authMiddleware, getCurrentUser)
router.post('/google', googleAuth)

module.exports = router
