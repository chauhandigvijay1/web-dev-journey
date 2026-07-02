const express = require('express')
const multer = require('multer')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  changePassword,
  deleteOwnAccount,
  getProfile,
  logoutAllSessions,
  updateAccount,
  updateAppearance,
  updateProfile,
  uploadAvatar,
  serveAvatar,
} = require('../controllers/userController')

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

router.get("/avatar/:filename", serveAvatar)

router.use(authMiddleware)
router.get('/me', getProfile)
router.patch('/profile', updateProfile)
router.patch('/account', updateAccount)
router.patch('/security/password', changePassword)
router.patch('/appearance', updateAppearance)
router.post('/logout-all', logoutAllSessions)
router.delete('/me', deleteOwnAccount)
router.post('/avatar', upload.single('file'), uploadAvatar)

module.exports = router
