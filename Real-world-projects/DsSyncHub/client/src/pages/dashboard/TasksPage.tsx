import { Calendar, Filter, MessageSquare, Paperclip, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AIAssistantDrawer from '../../components/ai/AIAssistantDrawer'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import AddTaskModal from '../../components/tasks/AddTaskModal'
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
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

const priorityColor: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
}

const TasksPage = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeWorkspaceId, items: workspaces, members } = useAppSelector((state) => state.workspace)
  const { items: tasks, selectedTaskId, filters, loading } = useAppSelector((state) => state.task)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [prefillAssigneeId, setPrefillAssigneeId] = useState('')
  const [searchInput, setSearchInput] = useState(filters.search)
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearch = useDebouncedValue(searchInput, 250)
  const pageSize = 16

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
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedTasks = filteredTasks.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  const selectedTask = useMemo(
    () => filteredTasks.find((task) => task.id === selectedTaskId) || tasks.find((task) => task.id === selectedTaskId) || null,
    [filteredTasks, selectedTaskId, tasks],
  )

  const openTask = (task: TaskItem) => {
    dispatch(setSelectedTaskId(task.id))
    dispatch(fetchTaskCommentsThunk(task.id))
  }

  const moveTask = (task: TaskItem, direction: 'left' | 'right') => {
    const currentIndex = columns.findIndex((column) => column.key === task.status)
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= columns.length) return
    dispatch(moveTaskThunk({ taskId: task.id, status: columns[targetIndex].key, order: task.order }))
  }

  const workspaceName =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId)?.name || 'Select workspace'

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Tasks need an active workspace so assignees, deadlines, comments, and board columns stay scoped to the right team." />
  }

  return (
    <section className="space-y-4 pb-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{workspaceName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => {
              setSearchInput(event.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search tasks"
            value={searchInput}
          />
          <button
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => {
              setSearchInput('')
              setCurrentPage(1)
              dispatch(clearTaskFilters())
            }}
            type="button"
          >
            <Filter className="mr-1 inline" size={14} />
            Clear Filters
          </button>
          <button
            className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
            onClick={() => setAddTaskOpen(true)}
            type="button"
          >
            <Plus className="mr-1 inline" size={14} />
            Add Task
          </button>
          <button
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => setAiOpen(true)}
            type="button"
          >
            Prioritize Board
          </button>
        </div>
      </div>

      <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-5">
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm capitalize dark:border-slate-700 dark:bg-slate-950" onChange={(event) => {
          setCurrentPage(1)
          dispatch(setTaskFilters({ status: event.target.value as 'all' | TaskStatus }))
        }} value={filters.status}>
          <option value="all">All Status</option>
          <option value="todo">todo</option>
          <option value="in_progress">in progress</option>
          <option value="review">review</option>
          <option value="done">done</option>
        </select>
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm capitalize dark:border-slate-700 dark:bg-slate-950" onChange={(event) => {
          setCurrentPage(1)
          dispatch(setTaskFilters({ priority: event.target.value as typeof filters.priority }))
        }} value={filters.priority}>
          <option value="all">All Priority</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="critical">critical</option>
        </select>
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => {
          setCurrentPage(1)
          dispatch(setTaskFilters({ assignee: event.target.value }))
        }} value={filters.assignee}>
          <option value="all">All Assignees</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.fullName}
            </option>
          ))}
        </select>
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => {
          setCurrentPage(1)
          dispatch(setTaskFilters({ due: event.target.value as typeof filters.due }))
        }} value={filters.due}>
          <option value="all">All Due Dates</option>
          <option value="today">Due Today</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => (
            <article className="min-w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={column.key}>
              <div className="mb-3 h-6 w-28 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" key={index} />
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
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <p>
              Showing {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
            </p>
            <p>{workspaceName}</p>
          </div>
          <div className="grid gap-4 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
            {columns.map((column) => {
              const tasksInColumn = paginatedTasks
                .filter((task) => task.status === column.key)
                .sort((a, b) => a.order - b.order)
              return (
                <article
                  className="min-w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  key={column.key}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 dark:text-white">{column.title}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{tasksInColumn.length}</span>
                  </div>
                  <div className="space-y-2">
                    {tasksInColumn.map((task) => (
                      <article className="rounded-xl border border-slate-200 dark:border-slate-700" key={task.id}>
                        <button
                          className="w-full p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                          onClick={() => openTask(task)}
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${priorityColor[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {task.labels.slice(0, 3).map((label) => (
                              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" key={label}>
                                {label}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                              <span>
                                <MessageSquare className="mr-1 inline" size={12} />
                                {task.commentsCount}
                              </span>
                              <span>
                                <Paperclip className="mr-1 inline" size={12} />
                                {task.attachments.length}
                              </span>
                            </div>
                            {task.dueDate && (
                              <span>
                                <Calendar className="mr-1 inline" size={12} />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </button>
                        <div className="flex gap-2 px-3 pb-3">
                          <button
                            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] dark:border-slate-700"
                            onClick={() => {
                              moveTask(task, 'left')
                            }}
                            type="button"
                          >
                            Prev
                          </button>
                          <button
                            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] dark:border-slate-700"
                            onClick={() => {
                              moveTask(task, 'right')
                            }}
                            type="button"
                          >
                            Next
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
          <Pagination currentPage={safeCurrentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
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
        className="fixed bottom-6 right-6 z-20 rounded-full bg-violet-600 p-3 text-white shadow-lg hover:bg-violet-700 md:hidden"
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
