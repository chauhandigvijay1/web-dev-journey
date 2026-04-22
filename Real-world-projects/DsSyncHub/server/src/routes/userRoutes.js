const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  changePassword,
  getProfile,
  logoutAllSessions,
  updateAccount,
  updateAppearance,
  updateProfile,
} = require('../controllers/userController')

const router = express.Router()

router.use(authMiddleware)
router.get('/me', getProfile)
router.patch('/profile', updateProfile)
router.patch('/account', updateAccount)
router.patch('/security/password', changePassword)
router.patch('/appearance', updateAppearance)
router.post('/logout-all', logoutAllSessions)

module.exports = router
