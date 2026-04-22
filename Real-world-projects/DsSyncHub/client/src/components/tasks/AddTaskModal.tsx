import { useState } from 'react'
import { useAppSelector } from '../../hooks/redux'
import type { TaskPriority } from '../../types/task'

type AddTaskModalProps = {
  open: boolean
  onClose: () => void
  defaultAssigneeId?: string
  onSubmit: (payload: {
    title: string
    description: string
    priority: TaskPriority
    assignee?: string
    dueDate?: string
    labels: string[]
  }) => Promise<void>
}

const AddTaskModal = ({ open, onClose, onSubmit, defaultAssigneeId }: AddTaskModalProps) => {
  const members = useAppSelector((state) => state.workspace.members)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assignee, setAssignee] = useState(defaultAssigneeId || '')
  const [dueDate, setDueDate] = useState('')
  const [labels, setLabels] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleCreate = async () => {
    const nextTitle = title.trim()
    const nextDescription = description.trim()
    const parsedDueDate = dueDate ? new Date(`${dueDate}T00:00:00`) : null
    const nextLabels = Array.from(
      new Set(
        labels
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ).slice(0, 8)

    if (nextTitle.length < 2) {
      setError('Task title must be at least 2 characters long.')
      return
    }

    if (nextTitle.length > 140) {
      setError('Task title must stay under 140 characters.')
      return
    }

    if (nextDescription.length > 3000) {
      setError('Task description must stay under 3000 characters.')
      return
    }

    if (parsedDueDate && Number.isNaN(parsedDueDate.getTime())) {
      setError('Choose a valid due date.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await onSubmit({
        title: nextTitle,
        description: nextDescription,
        priority,
        assignee: assignee || undefined,
        dueDate: dueDate || undefined,
        labels: nextLabels,
      })
      setTitle('')
      setDescription('')
      setPriority('medium')
      setAssignee('')
      setDueDate('')
      setLabels('')
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Task could not be created right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 p-4" onClick={onClose} role="presentation">
      <div
        className="mx-auto mt-16 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className="text-lg font-semibold">Add Task</h2>
        <div className="mt-4 grid gap-3">
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setTitle(event.target.value)} placeholder="Title" value={title} />
          <textarea className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setDescription(event.target.value)} placeholder="Description" rows={3} value={description} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm capitalize dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setPriority(event.target.value as TaskPriority)} value={priority}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
            <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setAssignee(event.target.value)} value={assignee}>
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} />
            <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => setLabels(event.target.value)} placeholder="Labels (comma-separated)" value={labels} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Up to 8 unique labels will be saved for each task.</p>
          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" disabled={submitting} onClick={onClose} type="button">Cancel</button>
          <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60" disabled={submitting} onClick={handleCreate} type="button">{submitting ? 'Creating...' : 'Create Task'}</button>
        </div>
      </div>
    </div>
  )
}

export default AddTaskModal
