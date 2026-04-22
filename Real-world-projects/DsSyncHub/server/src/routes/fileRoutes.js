const express = require('express')
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

router.use(authMiddleware)

router.get('/', listFiles)
router.get('/recent', listRecentFiles)
router.get('/content/:storedName', streamFileContent)
router.post('/upload', upload.single('file'), uploadFile)
router.delete('/:id', deleteFile)

module.exports = router
