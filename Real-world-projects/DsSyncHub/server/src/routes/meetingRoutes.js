const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  createMeetingRoom,
  joinMeetingMetadata,
  listUpcomingMeetings,
} = require('../controllers/meetingController')

const router = express.Router()

router.use(authMiddleware)

router.post('/rooms', createMeetingRoom)
router.get('/rooms/:roomId', joinMeetingMetadata)
router.get('/upcoming', listUpcomingMeetings)

module.exports = router
