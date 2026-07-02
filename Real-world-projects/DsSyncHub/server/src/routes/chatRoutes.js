const express = require('express')
const rateLimit = require('express-rate-limit')
const { authMiddleware } = require('../middleware/authMiddleware')

const messageLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages. Slow down.',
  },
})
const {
  createMessage,
  deleteMessage,
  editMessage,
  listDirectMessages,
  listMessages,
  addReaction,
  searchMessages,
} = require('../controllers/chatController')

const router = express.Router()

router.use(authMiddleware)

router.get('/messages', listMessages)
router.get('/search', searchMessages)
router.get('/direct/:userId', listDirectMessages)
router.post('/message', messageLimiter, createMessage)
router.patch('/message/:id', editMessage)
router.delete('/message/:id', deleteMessage)
router.post('/message/:id/reaction', addReaction)

module.exports = router
