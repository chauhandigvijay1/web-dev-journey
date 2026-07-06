import { Filter, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import AIAssistantDrawer from '../../components/ai/AIAssistantDrawer'
import EmptyState from '../../components/common/EmptyState'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import AddTaskModal from '../../components/tasks/AddTaskModal'
import KanbanColumn from '../../components/tasks/KanbanColumn'
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useTaskSocket } from '../../hooks/useTaskSocket'
import {
  clearTaskFilters,
  createTaskThunk,
  fetchTaskCommentsThunk,
  fetchTasksThunk,
  moveTaskThunk,
  setSelectedTaskId,
  setTaskFilters,
} from '../../store/taskSlice'
import { pushToast } from '../../store/toastSlice'
import { fetchWorkspaceMembersThunk } from '../../store/workspaceSlice'
import { getApiErrorMessage } from '../../utils/errors'
import type { TaskItem, TaskStatus } from '../../types/task'

const columns: { key: TaskStatus; title: string }[] = [
  { key: 'todo', title: 'Todo' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'review', title: 'Review' },
  { key: 'done', title: 'Done' },
]

const TasksPage = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeWorkspaceId, items: workspaces, members } = useAppSelector((state) => state.workspace)
  useTaskSocket()
  const { items: tasks, selectedTaskId, filters, loading } = useAppSelector((state) => state.task)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [prefillAssigneeId, setPrefillAssigneeId] = useState('')
  const [searchInput, setSearchInput] = useState(filters.search)
  const [activeDragTask, setActiveDragTask] = useState<TaskItem | null>(null)
  const debouncedSearch = useDebouncedValue(searchInput, 250)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchTasksThunk(activeWorkspaceId))
      dispatch(fetchWorkspaceMembersThunk(activeWorkspaceId))
    }
  }, [activeWorkspaceId, dispatch])

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      const assigneeFromQuery = searchParams.get('assignee') || ''
      window.setTimeout(() => {
        setPrefillAssigneeId(assigneeFromQuery)
        setAddTaskOpen(true)
      }, 0)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    dispatch(setTaskFilters({ search: debouncedSearch }))
  }, [debouncedSearch, dispatch])

  const filteredTasks = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return tasks.filter((task) => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.status !== 'all' && task.status !== filters.status) return false
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      if (filters.assignee !== 'all') {
        const assigneeId = task.assignee && typeof task.assignee !== 'string' ? task.assignee._id : ''
        if (assigneeId !== filters.assignee) return false
      }
      if (filters.due !== 'all') {
        if (!task.dueDate) return false
        const due = new Date(task.dueDate)
        due.setHours(0, 0, 0, 0)
        if (filters.due === 'today' && due.getTime() !== now.getTime()) return false
        if (filters.due === 'overdue' && due.getTime() >= now.getTime()) return false
      }
      return true
    })
  }, [tasks, filters])

  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, TaskItem[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    }
    for (const task of filteredTasks) {
      if (map[task.status]) {
        map[task.status].push(task)
      }
    }
    for (const key of Object.keys(map) as TaskStatus[]) {
      map[key].sort((a, b) => a.order - b.order)
    }
    return map
  }, [filteredTasks])

  const selectedTask = useMemo(
    () => filteredTasks.find((task) => task.id === selectedTaskId) || tasks.find((task) => task.id === selectedTaskId) || null,
    [filteredTasks, selectedTaskId, tasks],
  )

  const openTask = (task: TaskItem) => {
    dispatch(setSelectedTaskId(task.id))
    dispatch(fetchTaskCommentsThunk(task.id))
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveDragTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragTask(null)
    const { active, over } = event
    if (!over || !active) return

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    let targetStatus: TaskStatus
    let newOrder: number

    if (over.data.current?.type === 'column') {
      targetStatus = over.data.current.status as TaskStatus
      const tasksInTarget = tasksByColumn[targetStatus]
      newOrder = tasksInTarget.length > 0
        ? Math.max(...tasksInTarget.map((t) => t.order)) + 1
        : 1
    } else {
      const overTask = tasks.find((t) => t.id === over.id)
      if (!overTask) return
      targetStatus = overTask.status
      newOrder = overTask.order
    }

    if (task.status !== targetStatus || task.order !== newOrder) {
      dispatch(moveTaskThunk({ taskId, status: targetStatus, order: newOrder }))
    }
  }

  const workspaceName =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId)?.name || 'Select workspace'

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Tasks need an active workspace so assignees, deadlines, comments, and board columns stay scoped to the right team." />
  }

  const totalTaskCount = filteredTasks.length

  return (
    <section className="space-y-4 pb-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 glass-card p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white drop-shadow-md">Tasks</h1>
          <p className="text-sm text-zinc-400">{workspaceName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="tasks-search">Search tasks</label>
          <input
            className="rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20"
            id="tasks-search"
            onChange={(event) => {
              setSearchInput(event.target.value)
            }}
            placeholder="Search tasks"
            value={searchInput}
          />
          <button
            className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => {
              setSearchInput('')
              dispatch(clearTaskFilters())
            }}
            type="button"
          >
            <Filter className="mr-1 inline" size={14} />
            Clear Filters
          </button>
          <button
            className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 duration-300"
            onClick={() => setAddTaskOpen(true)}
            type="button"
          >
            <Plus className="mr-1 inline" size={14} />
            Add Task
          </button>
          <button
            className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => setAiOpen(true)}
            type="button"
          >
            Prioritize Board
          </button>
        </div>
      </div>

      <div className="flex gap-2 rounded-2xl border border-white/10 glass-card p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="sr-only" htmlFor="tasks-status-filter">Status filter</label>
        <select className="rounded-xl border border-white/10 px-3 py-2 text-sm capitalize dark:border-zinc-700 bg-black/20" id="tasks-status-filter" onChange={(event) => {
          dispatch(setTaskFilters({ status: event.target.value as 'all' | TaskStatus }))
        }} value={filters.status}>
          <option value="all">All Status</option>
          <option value="todo">todo</option>
          <option value="in_progress">in progress</option>
          <option value="review">review</option>
          <option value="done">done</option>
        </select>
        <label className="sr-only" htmlFor="tasks-priority-filter">Priority filter</label>
        <select className="rounded-xl border border-white/10 px-3 py-2 text-sm capitalize dark:border-zinc-700 bg-black/20" id="tasks-priority-filter" onChange={(event) => {
          dispatch(setTaskFilters({ priority: event.target.value as typeof filters.priority }))
        }} value={filters.priority}>
          <option value="all">All Priority</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="critical">critical</option>
        </select>
        <label className="sr-only" htmlFor="tasks-assignee-filter">Assignee filter</label>
        <select className="rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20" id="tasks-assignee-filter" onChange={(event) => {
          dispatch(setTaskFilters({ assignee: event.target.value }))
        }} value={filters.assignee}>
          <option value="all">All Assignees</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.fullName}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="tasks-due-filter">Due date filter</label>
        <select className="rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20" id="tasks-due-filter" onChange={(event) => {
          dispatch(setTaskFilters({ due: event.target.value as typeof filters.due }))
        }} value={filters.due}>
          <option value="all">All Due Dates</option>
          <option value="today">Due Today</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {columns.map((column) => (
            <article className="w-[280px] shrink-0 rounded-2xl border border-white/10 glass-card p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" key={column.key}>
              <div className="mb-3 h-6 w-28 animate-pulse rounded-full glass-card/10 dark:bg-zinc-800" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="h-28 animate-pulse rounded-xl glass-card/10 dark:bg-zinc-800" key={index} />
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          actionLabel="Create task"
          description={
            filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || filters.due !== 'all'
              ? 'Try clearing one or two filters to bring matching work back into view.'
              : 'Create your first task to start turning plans into visible, trackable execution.'
          }
          onAction={() => setAddTaskOpen(true)}
          title={filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || filters.due !== 'all' ? 'No tasks match these filters' : 'No tasks yet'}
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <p>{totalTaskCount} tasks</p>
            <p>{workspaceName}</p>
          </div>
          <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.key}
                  onOpen={openTask}
                  status={column.key}
                  tasks={tasksByColumn[column.key]}
                  title={column.title}
                />
              ))}
            </div>
            <DragOverlay>
              {activeDragTask ? (
                <div className="rotate-3 rounded-xl border border-white/20 bg-zinc-900 p-3 shadow-2xl opacity-90">
                  <p className="text-sm font-semibold text-white">{activeDragTask.title}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </>
      )}

      <AddTaskModal
        defaultAssigneeId={prefillAssigneeId || undefined}
        key={prefillAssigneeId || 'new-task'}
        onClose={() => setAddTaskOpen(false)}
        onSubmit={async (payload) => {
          if (!activeWorkspaceId) return
          try {
            await dispatch(
              createTaskThunk({
                workspace: activeWorkspaceId,
                ...payload,
              }),
            ).unwrap()
            dispatch(pushToast({
              title: 'Task created',
              description: `${payload.title} is now on the board.`,
              tone: 'success',
            }))
          } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Task could not be created right now.'))
          }
        }}
        open={addTaskOpen}
      />

      <TaskDetailDrawer
        key={selectedTask ? `${selectedTask.id}-${selectedTask.updatedAt}` : 'task-drawer'}
        onClose={() => dispatch(setSelectedTaskId(null))}
        open={Boolean(selectedTask)}
        task={selectedTask}
      />

      <button
        aria-label="Add task"
        className="fixed bottom-6 right-6 z-20 rounded-full bg-brand-500 p-3 text-white shadow-lg hover:bg-brand-400 md:hidden"
        onClick={() => setAddTaskOpen(true)}
        type="button"
      >
        <Plus size={20} />
      </button>
      <AIAssistantDrawer
        actions={[
          {
            label: 'Prioritize Tasks',
            action: 'prioritize',
            buildPayload: () => ({
              body: {
                tasks: tasks.map((item) => ({
                  title: item.title,
                  priority: item.priority,
                  status: item.status,
                  dueDate: item.dueDate,
                })),
              },
              prompt: tasks.map((item) => item.title).join(', '),
            }),
          },
          {
            label: 'Generate Sprint Plan',
            action: 'sprint-plan',
            buildPayload: () => ({
              body: {
                input: tasks
                  .slice(0, 25)
                  .map((item) => `${item.title} (${item.status}, ${item.priority})`)
                  .join('\n'),
              },
              prompt: tasks.map((item) => item.title).join(', '),
            }),
          },
          {
            label: 'Break Goal into Tasks',
            action: 'tasks-from-text',
            buildPayload: () => ({
              body: {
                text: tasks.map((item) => item.title).join('\n'),
              },
              prompt: tasks.map((item) => item.title).join(', '),
            }),
          },
        ]}
        onClose={() => setAiOpen(false)}
        open={aiOpen}
        title="Task AI Assistant"
        workspaceId={activeWorkspaceId}
      />
    </section>
  )
}

export default TasksPage
