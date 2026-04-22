const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { globalSearch } = require('../controllers/searchController')

const router = express.Router()

router.use(authMiddleware)
router.get('/', globalSearch)

module.exports = router
