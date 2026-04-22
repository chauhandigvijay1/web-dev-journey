export type CalendarView = 'month' | 'week' | 'agenda'

export type CalendarEvent = {
  id: string
  workspace: string
  title: string
  date: string
  time?: string
  description?: string
  source: 'task' | 'event' | 'reminder' | 'meeting'
  link?: string
  taskId?: string
}
