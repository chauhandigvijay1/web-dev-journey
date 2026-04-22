const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { aiUsageLimit } = require('../middleware/aiUsageLimit')
const {
  chatSummary,
  improve,
  prioritize,
  sprintPlan,
  summarize,
  tasksFromText,
} = require('../controllers/aiController')

const router = express.Router()

router.use(authMiddleware)
router.use(aiUsageLimit)

router.post('/summarize', summarize)
router.post('/improve', improve)
router.post('/tasks-from-text', tasksFromText)
router.post('/chat-summary', chatSummary)
router.post('/sprint-plan', sprintPlan)
router.post('/prioritize', prioritize)

module.exports = router
