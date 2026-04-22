const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  deleteNotification,
  listNotifications,
  markAllRead,
  markNotificationRead,
} = require('../controllers/notificationController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', listNotifications)
router.patch('/:id/read', markNotificationRead)
router.patch('/read-all', markAllRead)
router.delete('/:id', deleteNotification)

module.exports = router
