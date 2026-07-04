import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/common/ConfirmModal'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useCalendarSocket } from '../../hooks/useCalendarSocket'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import {
  createCalendarEventThunk,
  deleteCalendarEventThunk,
  fetchCalendarEventsThunk,
  setCalendarView,
  setSelectedDate,
} from '../../store/calendarSlice'
import { pushToast } from '../../store/toastSlice'
import { fetchTasksThunk } from '../../store/taskSlice'

const CalendarPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace)
  const { items: tasks } = useAppSelector((state) => state.task)
  const { events, selectedDate, view, loading } = useAppSelector((state) => state.calendar)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useCalendarSocket()

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchTasksThunk(activeWorkspaceId))
    }
  }, [activeWorkspaceId, dispatch])

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchCalendarEventsThunk({ workspaceId: activeWorkspaceId }))
    }
  }, [activeWorkspaceId, dispatch])

  const mergedEvents = useMemo(() => {
    const taskEvents = tasks
      .filter((task) => Boolean(task.dueDate))
      .map((task) => ({
        id: task.id,
        workspace: task.workspace,
        title: task.title,
        date: task.dueDate || '',
        source: 'task' as const,
        taskId: task.id,
        link: '/tasks',
      }))
    return [...events, ...taskEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events, tasks])

  const selectedDateValue = useMemo(() => new Date(selectedDate), [selectedDate])

  const visibleEvents = useMemo(() => {
    const selectedYear = selectedDateValue.getFullYear()
    const selectedMonth = selectedDateValue.getMonth()
    const selectedDay = selectedDateValue.toDateString()
    const weekStart = new Date(selectedDateValue)
    weekStart.setDate(selectedDateValue.getDate() - selectedDateValue.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const agendaEnd = new Date(selectedDateValue)
    agendaEnd.setDate(selectedDateValue.getDate() + 14)

    return mergedEvents.filter((item) => {
      const eventDate = new Date(item.date)

      if (view === 'month') {
        return eventDate.getFullYear() === selectedYear && eventDate.getMonth() === selectedMonth
      }

      if (view === 'week') {
        return eventDate >= weekStart && eventDate < weekEnd
      }

      return eventDate.toDateString() === selectedDay || (eventDate > selectedDateValue && eventDate <= agendaEnd)
    })
  }, [mergedEvents, selectedDateValue, view])

  const shiftSelectedDate = (direction: 'previous' | 'next') => {
    const nextDate = new Date(selectedDateValue)
    const step = view === 'month' ? 30 : view === 'week' ? 7 : 1
    nextDate.setDate(selectedDateValue.getDate() + (direction === 'next' ? step : -step))
    dispatch(setSelectedDate(nextDate.toISOString()))
  }

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Calendar views pull task deadlines and team events from the active workspace, so choose one first." />
  }

  return (
    <section className="space-y-4 pb-5">
      <div className="rounded-2xl border border-white/10 glass-card p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <div className="flex gap-2">
            <button aria-label="Previous date range" className="rounded-xl border border-white/10 p-2 dark:border-zinc-700" onClick={() => shiftSelectedDate('previous')} type="button"><ChevronLeft size={16} /></button>
            <button className="rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700" onClick={() => dispatch(setSelectedDate(new Date().toISOString()))} type="button">Today</button>
            <button aria-label="Next date range" className="rounded-xl border border-white/10 p-2 dark:border-zinc-700" onClick={() => shiftSelectedDate('next')} type="button"><ChevronRight size={16} /></button>
            {(['month', 'week', 'agenda'] as const).map((item) => (
              <button className={`rounded-xl px-3 py-2 text-sm ${view === item ? 'bg-brand-500 text-white' : 'border border-white/10'}`} key={item} onClick={() => dispatch(setCalendarView(item))} type="button">{item}</button>
            ))}
            <button className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white" onClick={() => setOpen(true)} type="button"><Plus className="mr-1 inline" size={14} />Add Event</button>
          </div>
        </div>
        <p className="mt-2 text-sm text-zinc-500">Selected date: {selectedDateValue.toDateString()} | View: {view}</p>
      </div>

      <div className="rounded-2xl border border-white/10 glass-card p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-16 animate-pulse rounded-xl border border-white/10 glass-card/5 dark:border-zinc-700 bg-black/20" key={index} />
            ))}
          </div>
        ) : !visibleEvents.length ? (
          <div className="py-12 text-center text-sm text-zinc-500">Nothing scheduled in this {view} view.</div>
        ) : (
          <div className="space-y-2">
            {visibleEvents.map((item) => (
              <div className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2 dark:border-zinc-700" key={`${item.source}-${item.id}`}>
                <button className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left" onClick={() => item.taskId ? navigate('/tasks') : undefined} type="button">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-xs text-zinc-500">{new Date(item.date).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full glass-card/10 px-2 py-1 text-xs capitalize dark:bg-zinc-800">{item.source}</span>
                </button>
                {!item.taskId && item.source !== 'task' && (
                  <button
                    aria-label={`Delete ${item.title}`}
                    className="ml-2 rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-600 dark:border-rose-900/40"
                    onClick={() => setDeleteConfirmId(item.id)}
                    type="button"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        confirmLabel="Delete"
        description="This event will be permanently removed from the calendar."
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={async () => {
          if (!deleteConfirmId) return
          try {
            await dispatch(deleteCalendarEventThunk(deleteConfirmId)).unwrap()
            dispatch(pushToast({ title: 'Event deleted', description: 'The event has been removed.', tone: 'success' }))
          } catch {
            dispatch(pushToast({ title: 'Failed to delete', description: 'Could not delete the event. Please try again.', tone: 'error' }))
          }
          setDeleteConfirmId(null)
        }}
        open={Boolean(deleteConfirmId)}
        title="Delete event?"
        variant="danger"
      />

      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-zinc-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 glass-card p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Add Event</h2>
            <div className="mt-3 space-y-2">
              <label className="sr-only" htmlFor="calendar-event-title">Event title</label>
              <input className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20" id="calendar-event-title" onChange={(event) => setTitle(event.target.value)} placeholder="Title" value={title} />
              <label className="sr-only" htmlFor="calendar-event-date">Event date</label>
              <input className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20" id="calendar-event-date" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
              <label className="sr-only" htmlFor="calendar-event-end-date">Event end date</label>
              <input className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20" id="calendar-event-end-date" onChange={(event) => setEndDate(event.target.value)} placeholder="End date (optional)" type="date" value={endDate} />
              <label className="flex items-center gap-2 text-sm" htmlFor="calendar-event-all-day">
                <input checked={allDay} id="calendar-event-all-day" onChange={(event) => setAllDay(event.target.checked)} type="checkbox" />
                All day
              </label>
              <label className="sr-only" htmlFor="calendar-event-time">Event time</label>
              <input className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20" id="calendar-event-time" onChange={(event) => setTime(event.target.value)} placeholder="Time (optional)" value={time} />
              <label className="sr-only" htmlFor="calendar-event-description">Event description</label>
              <textarea className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20" id="calendar-event-description" onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" rows={3} value={description} />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700" onClick={() => setOpen(false)} type="button">Cancel</button>
              <button className="rounded-xl bg-brand-500 px-3 py-2 text-sm text-white" onClick={() => {
                if (!title.trim() || !activeWorkspaceId) return
                dispatch(createCalendarEventThunk({
                  workspace: activeWorkspaceId,
                  title: title.trim(),
                  date,
                  time,
                  endDate: endDate || undefined,
                  allDay,
                  description,
                  source: 'event',
                }))
                setOpen(false)
                setTitle('')
                setDescription('')
                setTime('')
                setEndDate('')
                setAllDay(false)
              }} type="button">Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default CalendarPage
