const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  createMessage,
  deleteMessage,
  editMessage,
  listDirectMessages,
  listMessages,
} = require('../controllers/chatController')

const router = express.Router()

router.use(authMiddleware)

router.get('/messages', listMessages)
router.get('/direct/:userId', listDirectMessages)
router.post('/message', createMessage)
router.patch('/message/:id', editMessage)
router.delete('/message/:id', deleteMessage)

module.exports = router
