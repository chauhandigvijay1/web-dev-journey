const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { exportWorkspace } = require('../controllers/exportController')

const router = express.Router()

router.use(authMiddleware)
router.get('/workspace/:id', exportWorkspace)

module.exports = router
