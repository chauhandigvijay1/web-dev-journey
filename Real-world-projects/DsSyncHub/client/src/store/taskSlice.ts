import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { taskApi } from '../services/taskApi'
import type { TaskComment, TaskItem, TaskPriority, TaskStatus } from '../types/task'

type TaskFilters = {
  search: string
  status: 'all' | TaskStatus
  priority: 'all' | TaskPriority
  assignee: string
  due: 'all' | 'today' | 'overdue'
}

type TaskState = {
  items: TaskItem[]
  selectedTaskId: string | null
  comments: TaskComment[]
  filters: TaskFilters
  loading: boolean
}

const initialState: TaskState = {
  items: [],
  selectedTaskId: null,
  comments: [],
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    due: 'all',
  },
  loading: false,
}

export const fetchTasksThunk = createAsyncThunk('task/list', async (workspaceId: string) => {
  const response = await taskApi.list(workspaceId)
  return response.tasks
})

export const createTaskThunk = createAsyncThunk(
  'task/create',
  async (payload: {
    workspace: string
    title: string
    description: string
    priority: TaskPriority
    assignee?: string
    dueDate?: string
    labels: string[]
  }) => {
    const response = await taskApi.create(payload)
    return response.task
  },
)

export const updateTaskThunk = createAsyncThunk(
  'task/update',
  async (payload: { taskId: string; data: Partial<TaskItem> }) => {
    const response = await taskApi.update(payload.taskId, payload.data)
    return response.task
  },
)

export const moveTaskThunk = createAsyncThunk(
  'task/move',
  async (payload: { taskId: string; status: TaskStatus; order: number }) => {
    const response = await taskApi.move(payload.taskId, {
      status: payload.status,
      order: payload.order,
    })
    return response.task
  },
)

export const completeTaskThunk = createAsyncThunk('task/complete', async (taskId: string) => {
  const response = await taskApi.complete(taskId)
  return response.task
})

export const deleteTaskThunk = createAsyncThunk('task/delete', async (taskId: string) => {
  await taskApi.remove(taskId)
  return taskId
})

export const fetchTaskCommentsThunk = createAsyncThunk('task/comments', async (taskId: string) => {
  const response = await taskApi.comments(taskId)
  return response.comments
})

export const addTaskCommentThunk = createAsyncThunk(
  'task/addComment',
  async (payload: { taskId: string; content: string; mentions?: string[] }, { dispatch }) => {
    await taskApi.addComment(payload.taskId, {
      content: payload.content,
      mentions: payload.mentions || [],
    })
    await dispatch(fetchTaskCommentsThunk(payload.taskId))
  },
)

export const updateTaskCommentThunk = createAsyncThunk(
  'task/updateComment',
  async (payload: { taskId: string; commentId: string; content: string; mentions?: string[] }, { dispatch }) => {
    await taskApi.updateComment(payload.commentId, {
      content: payload.content,
      mentions: payload.mentions || [],
    })
    await dispatch(fetchTaskCommentsThunk(payload.taskId))
  },
)

export const deleteTaskCommentThunk = createAsyncThunk(
  'task/deleteComment',
  async (payload: { taskId: string; commentId: string }, { dispatch }) => {
    await taskApi.deleteComment(payload.commentId)
    await dispatch(fetchTaskCommentsThunk(payload.taskId))
  },
)

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setSelectedTaskId: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskId = action.payload
    },
    setTaskFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearTaskFilters: (state) => {
      state.filters = initialState.filters
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTasksThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTasksThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(moveTaskThunk.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(completeTaskThunk.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        if (state.selectedTaskId === action.payload) {
          state.selectedTaskId = null
        }
      })
      .addCase(fetchTaskCommentsThunk.fulfilled, (state, action) => {
        state.comments = action.payload
      })
  },
})

export const { setSelectedTaskId, setTaskFilters, clearTaskFilters } = taskSlice.actions
export default taskSlice.reducer
