const express = require('express')
const rateLimit = require('express-rate-limit')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  deleteFile,
  listFiles,
  listRecentFiles,
  streamFileContent,
  upload,
  uploadFile,
} = require('../controllers/fileController')

const router = express.Router()

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many uploads. Try again after a minute.',
  },
})

router.use(authMiddleware)

router.get('/', listFiles)
router.get('/recent', listRecentFiles)
router.get('/content/:workspaceId/:filename', streamFileContent)
router.get('/content/:filename', streamFileContent)
router.post('/upload', uploadLimiter, upload.single('file'), uploadFile)
router.delete('/:id', deleteFile)

module.exports = router
