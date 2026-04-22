const axios = require('axios')

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'llama-3.1-8b-instant'
const REQUEST_TIMEOUT_MS = 12000

const sanitizePrompt = (text = '', maxLength = 6000) =>
  String(text || '')
    .replace(/\0/g, '')
    .trim()
    .slice(0, maxLength)

const callGroq = async (prompt, fallback) => {
  const apiKey = process.env.GROQ_API_KEY
  const cleanedPrompt = sanitizePrompt(prompt)
  if (!cleanedPrompt) return fallback
  if (!apiKey) return fallback

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: DEFAULT_MODEL,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'You are a concise productivity assistant for collaborative work software. Return practical output.',
          },
          { role: 'user', content: cleanedPrompt },
        ],
      },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data?.choices?.[0]?.message?.content?.trim() || fallback
  } catch (_error) {
    return fallback
  }
}

const summarizeText = (text) =>
  callGroq(
    `Summarize the following text into 4-6 actionable bullets:\n\n${sanitizePrompt(text)}`,
    'Summary unavailable right now. Please retry.',
  )

const improveWriting = (text) =>
  callGroq(
    `Improve this writing for clarity and professionalism while preserving intent:\n\n${sanitizePrompt(text)}`,
    'Improved version unavailable right now. Please retry.',
  )

const convertTextToTasks = (text) =>
  callGroq(
    `Convert this content into a prioritized task checklist with owners as placeholders and due suggestions:\n\n${sanitizePrompt(text)}`,
    '- [ ] Draft tasks from this content\n- [ ] Assign owners\n- [ ] Add due dates',
  )

const summarizeMessages = (messages = []) =>
  callGroq(
    `Summarize this conversation into: context, decisions, blockers, and next actions.\n\n${sanitizePrompt(
      Array.isArray(messages) ? messages.join('\n') : String(messages),
      8000,
    )}`,
    'Conversation summary unavailable right now. Please retry.',
  )

const generateSprintPlan = (input) =>
  callGroq(
    `Generate a practical 1-week sprint plan based on this input. Include goals, backlog items, and risk notes:\n\n${sanitizePrompt(input, 8000)}`,
    'Sprint plan unavailable right now. Please retry.',
  )

const prioritizeTasks = (tasks = []) =>
  callGroq(
    `Prioritize these tasks with rationale and suggested execution order:\n\n${sanitizePrompt(
      Array.isArray(tasks) ? tasks.map((task) => `${task.title || task}`).join('\n') : String(tasks),
      8000,
    )}`,
    'Task prioritization unavailable right now. Please retry.',
  )

module.exports = {
  summarizeText,
  improveWriting,
  convertTextToTasks,
  summarizeMessages,
  generateSprintPlan,
  prioritizeTasks,
  sanitizePrompt,
}
