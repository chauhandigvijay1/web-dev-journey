export type AIAction =
  | 'summarize'
  | 'improve'
  | 'tasks-from-text'
  | 'chat-summary'
  | 'sprint-plan'
  | 'prioritize'

export type AIHistoryItem = {
  id: string
  action: AIAction
  prompt: string
  output: string
  createdAt: string
}
