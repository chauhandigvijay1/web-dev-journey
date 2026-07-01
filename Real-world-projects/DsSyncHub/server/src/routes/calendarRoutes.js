const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { listEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/calendarController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', listEvents)
router.post('/', createEvent)
router.patch('/:id', updateEvent)
router.delete('/:id', deleteEvent)

module.exports = router
