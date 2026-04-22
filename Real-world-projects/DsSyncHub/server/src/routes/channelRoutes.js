const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  createChannel,
  deleteChannel,
  listChannels,
  updateChannel,
} = require('../controllers/channelController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', listChannels)
router.post('/', createChannel)
router.patch('/:id', updateChannel)
router.delete('/:id', deleteChannel)

module.exports = router
