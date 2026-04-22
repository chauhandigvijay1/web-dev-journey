const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { listWorkspaceActivity } = require('../controllers/activityController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', listWorkspaceActivity)

module.exports = router
