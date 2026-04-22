import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { workspaceApi } from '../services/workspaceApi'
import type { WorkspaceItem, WorkspaceMember, WorkspaceRole } from '../types/workspace'

type WorkspaceState = {
  items: WorkspaceItem[]
  activeWorkspaceId: string | null
  members: WorkspaceMember[]
  loading: boolean
}

const getSavedWorkspaceId = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem('dssync-active-workspace')
}

const initialState: WorkspaceState = {
  items: [],
  activeWorkspaceId: getSavedWorkspaceId(),
  members: [],
  loading: false,
}

export const fetchWorkspacesThunk = createAsyncThunk('workspace/list', async () => {
  const response = await workspaceApi.list()
  return response.workspaces
})

export const createWorkspaceThunk = createAsyncThunk(
  'workspace/create',
  async (payload: { name: string; description: string }) => {
    const response = await workspaceApi.create(payload)
    return response.workspace
  },
)

export const fetchWorkspaceMembersThunk = createAsyncThunk(
  'workspace/members',
  async (workspaceId: string) => {
    const response = await workspaceApi.members(workspaceId)
    return response.members
  },
)

export const inviteWorkspaceMemberThunk = createAsyncThunk(
  'workspace/invite',
  async (payload: { workspaceId: string; email: string; role: WorkspaceRole }, { dispatch }) => {
    await workspaceApi.inviteMember(payload.workspaceId, {
      email: payload.email,
      role: payload.role,
    })
    await dispatch(fetchWorkspaceMembersThunk(payload.workspaceId))
  },
)

export const updateWorkspaceMemberRoleThunk = createAsyncThunk(
  'workspace/updateRole',
  async (
    payload: { workspaceId: string; memberId: string; role: WorkspaceRole },
    { dispatch },
  ) => {
    await workspaceApi.updateMemberRole(payload.workspaceId, payload.memberId, payload.role)
    await dispatch(fetchWorkspaceMembersThunk(payload.workspaceId))
  },
)

export const removeWorkspaceMemberThunk = createAsyncThunk(
  'workspace/removeMember',
  async (payload: { workspaceId: string; memberId: string }, { dispatch }) => {
    await workspaceApi.removeMember(payload.workspaceId, payload.memberId)
    await dispatch(fetchWorkspaceMembersThunk(payload.workspaceId))
  },
)

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveWorkspaceId: (state, action: PayloadAction<string>) => {
      state.activeWorkspaceId = action.payload
      window.localStorage.setItem('dssync-active-workspace', action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspacesThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchWorkspacesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        const savedWorkspaceStillExists = action.payload.some(
          (workspace) => workspace.id === state.activeWorkspaceId,
        )

        if (savedWorkspaceStillExists) {
          return
        }

        if (action.payload[0]?.id) {
          state.activeWorkspaceId = action.payload[0].id
          window.localStorage.setItem('dssync-active-workspace', action.payload[0].id)
          return
        }

        state.activeWorkspaceId = null
        window.localStorage.removeItem('dssync-active-workspace')
      })
      .addCase(fetchWorkspacesThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(createWorkspaceThunk.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
        state.activeWorkspaceId = action.payload.id
        window.localStorage.setItem('dssync-active-workspace', action.payload.id)
      })
      .addCase(fetchWorkspaceMembersThunk.fulfilled, (state, action) => {
        state.members = action.payload
      })
  },
})

export const { setActiveWorkspaceId } = workspaceSlice.actions
export default workspaceSlice.reducer
