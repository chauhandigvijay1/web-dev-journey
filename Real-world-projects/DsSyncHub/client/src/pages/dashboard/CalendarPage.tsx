import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { addCalendarEvent, setCalendarView, setSelectedDate } from '../../store/calendarSlice'
import { fetchTasksThunk } from '../../store/taskSlice'

const CalendarPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace)
  const { items: tasks } = useAppSelector((state) => state.task)
  const { events, selectedDate, view } = useAppSelector((state) => state.calendar)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (activeWorkspaceId) dispatch(fetchTasksThunk(activeWorkspaceId))
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
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <div className="flex gap-2">
            <button className="rounded-xl border border-slate-200 p-2 dark:border-slate-700" onClick={() => shiftSelectedDate('previous')} type="button"><ChevronLeft size={16} /></button>
            <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" onClick={() => dispatch(setSelectedDate(new Date().toISOString()))} type="button">Today</button>
            <button className="rounded-xl border border-slate-200 p-2 dark:border-slate-700" onClick={() => shiftSelectedDate('next')} type="button"><ChevronRight size={16} /></button>
            {(['month', 'week', 'agenda'] as const).map((item) => (
              <button className={`rounded-xl px-3 py-2 text-sm ${view === item ? 'bg-violet-600 text-white' : 'border border-slate-200 dark:border-slate-700'}`} key={item} onClick={() => dispatch(setCalendarView(item))} type="button">{item}</button>
            ))}
            <button className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white" onClick={() => setOpen(true)} type="button"><Plus className="mr-1 inline" size={14} />Add Event</button>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">Selected date: {selectedDateValue.toDateString()} | View: {view}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!visibleEvents.length ? (
          <div className="py-12 text-center text-sm text-slate-500">Nothing scheduled in this {view} view.</div>
        ) : (
          <div className="space-y-2">
            {visibleEvents.map((item) => (
              <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left dark:border-slate-700" key={`${item.source}-${item.id}`} onClick={() => item.taskId ? navigate('/tasks') : undefined} type="button">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize dark:bg-slate-800">{item.source}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Add Event</h2>
            <div className="mt-3 space-y-2">
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setTitle(event.target.value)} placeholder="Title" value={title} />
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
              <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setTime(event.target.value)} placeholder="Time (optional)" value={time} />
              <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" rows={3} value={description} />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" onClick={() => setOpen(false)} type="button">Cancel</button>
              <button className="rounded-xl bg-violet-600 px-3 py-2 text-sm text-white" onClick={() => {
                if (!title.trim() || !activeWorkspaceId) return
                dispatch(addCalendarEvent({
                  id: `${Date.now()}`,
                  workspace: activeWorkspaceId,
                  title: title.trim(),
                  date: new Date(`${date}T${time || '09:00'}`).toISOString(),
                  description,
                  time,
                  source: 'event',
                }))
                setOpen(false)
                setTitle('')
                setDescription('')
              }} type="button">Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default CalendarPage
