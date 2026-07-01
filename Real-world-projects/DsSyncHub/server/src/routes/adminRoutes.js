const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { adminMiddleware } = require('../middleware/adminMiddleware')
const { listUsers, getUserDetail, deleteUser, listWorkspaces, getStats, updateUserRole } = require('../controllers/adminController')

const router = express.Router()

router.use(authMiddleware, adminMiddleware)

router.get('/stats', getStats)
router.get('/users', listUsers)
router.get('/users/:id', getUserDetail)
router.patch('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)
router.get('/workspaces', listWorkspaces)

module.exports = router
