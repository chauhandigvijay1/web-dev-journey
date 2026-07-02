const express = require('express')
const rateLimit = require('express-rate-limit')
const { authMiddleware } = require('../middleware/authMiddleware')
const { globalSearch } = require('../controllers/searchController')

const router = express.Router()

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many search requests. Try again shortly.',
  },
})

router.use(authMiddleware)
router.get('/', searchLimiter, globalSearch)

module.exports = router
