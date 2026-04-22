const {
  convertTextToTasks,
  generateSprintPlan,
  improveWriting,
  prioritizeTasks,
  sanitizePrompt,
  summarizeMessages,
  summarizeText,
} = require('../services/aiService')

const maxInput = (input, size = 7000) => sanitizePrompt(input, size)

const summarize = async (req, res, next) => {
  try {
    const text = maxInput(req.body.text)
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' })
    const output = await summarizeText(text)
    return res.status(200).json({ success: true, output, usage: req.aiUsage })
  } catch (error) {
    return next(error)
  }
}

const improve = async (req, res, next) => {
  try {
    const text = maxInput(req.body.text)
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' })
    const output = await improveWriting(text)
    return res.status(200).json({ success: true, output, usage: req.aiUsage })
  } catch (error) {
    return next(error)
  }
}

const tasksFromText = async (req, res, next) => {
  try {
    const text = maxInput(req.body.text)
    if (!text) return res.status(400).json({ success: false, message: 'text is required.' })
    const output = await convertTextToTasks(text)
    return res.status(200).json({ success: true, output, usage: req.aiUsage })
  } catch (error) {
    return next(error)
  }
}

const chatSummary = async (req, res, next) => {
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages.slice(-200) : []
    if (!messages.length) return res.status(400).json({ success: false, message: 'messages are required.' })
    const output = await summarizeMessages(messages)
    return res.status(200).json({ success: true, output, usage: req.aiUsage })
  } catch (error) {
    return next(error)
  }
}

const sprintPlan = async (req, res, next) => {
  try {
    const input = maxInput(req.body.input)
    if (!input) return res.status(400).json({ success: false, message: 'input is required.' })
    const output = await generateSprintPlan(input)
    return res.status(200).json({ success: true, output, usage: req.aiUsage })
  } catch (error) {
    return next(error)
  }
}

const prioritize = async (req, res, next) => {
  try {
    const tasks = Array.isArray(req.body.tasks) ? req.body.tasks.slice(0, 200) : []
    if (!tasks.length) return res.status(400).json({ success: false, message: 'tasks are required.' })
    const output = await prioritizeTasks(tasks)
    return res.status(200).json({ success: true, output, usage: req.aiUsage })
  } catch (error) {
    return next(error)
  }
}

module.exports = { summarize, improve, tasksFromText, chatSummary, sprintPlan, prioritize }
