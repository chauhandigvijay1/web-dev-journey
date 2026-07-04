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

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many searches. Try again later.',
  },
})

const editLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many edits. Slow down.',
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
router.get('/search', searchLimiter, searchMessages)
router.get('/direct/:userId', listDirectMessages)
router.post('/message', messageLimiter, createMessage)
router.patch('/message/:id', editLimiter, editMessage)
router.delete('/message/:id', editLimiter, deleteMessage)
router.post('/message/:id/reaction', messageLimiter, addReaction)

module.exports = router
