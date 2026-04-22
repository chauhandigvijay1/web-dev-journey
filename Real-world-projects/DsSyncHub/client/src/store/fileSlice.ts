import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fileApi } from '../services/fileApi'
import type { FileItem } from '../types/file'

type FileState = {
  items: FileItem[]
  recent: FileItem[]
  loading: boolean
}

const initialState: FileState = {
  items: [],
  recent: [],
  loading: false,
}

export const fetchFilesThunk = createAsyncThunk('file/list', async (workspaceId: string) => {
  const response = await fileApi.list(workspaceId)
  return response.files
})

export const fetchRecentFilesThunk = createAsyncThunk(
  'file/recent',
  async (payload: { workspaceId: string; limit?: number }) => {
    const response = await fileApi.recent(payload.workspaceId, payload.limit)
    return response.files
  },
)

export const uploadFileThunk = createAsyncThunk(
  'file/upload',
  async (payload: Parameters<typeof fileApi.upload>[0], { dispatch }) => {
    const response = await fileApi.upload(payload)
    await dispatch(fetchRecentFilesThunk({ workspaceId: payload.workspace, limit: 8 }))
    return response
  },
)

export const deleteFileThunk = createAsyncThunk(
  'file/delete',
  async (payload: { fileId: string; workspaceId: string }, { dispatch }) => {
    await fileApi.remove(payload.fileId)
    await dispatch(fetchRecentFilesThunk({ workspaceId: payload.workspaceId, limit: 8 }))
    return payload.fileId
  },
)

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilesThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFilesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchFilesThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(fetchRecentFilesThunk.fulfilled, (state, action) => {
        state.recent = action.payload
      })
      .addCase(uploadFileThunk.fulfilled, (state, action) => {
        state.items = [action.payload.file, ...state.items.filter((item) => item.id !== action.payload.file.id)]
      })
      .addCase(deleteFileThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.recent = state.recent.filter((item) => item.id !== action.payload)
      })
  },
})

export default fileSlice.reducer
