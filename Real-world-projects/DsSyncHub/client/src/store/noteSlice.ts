import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { noteApi } from '../services/noteApi'
import type { NoteFilter, NoteItem } from '../types/note'

type NoteState = {
  items: NoteItem[]
  selectedNoteId: string | null
  loading: boolean
  saving: 'idle' | 'saving' | 'saved' | 'error'
  search: string
  filter: NoteFilter
  dirty: boolean
}

const initialState: NoteState = {
  items: [],
  selectedNoteId: null,
  loading: false,
  saving: 'idle',
  search: '',
  filter: 'all',
  dirty: false,
}

export const fetchNotesThunk = createAsyncThunk('note/list', async (workspaceId: string) => {
  const response = await noteApi.list(workspaceId)
  return response.notes
})

export const createNoteThunk = createAsyncThunk('note/create', async (workspaceId: string) => {
  const response = await noteApi.create({ workspace: workspaceId, title: 'Untitled Note' })
  return response.note
})

export const updateNoteThunk = createAsyncThunk(
  'note/update',
  async (payload: { noteId: string; data: Partial<NoteItem> }) => {
    const response = await noteApi.update(payload.noteId, payload.data)
    return response.note
  },
)

export const deleteNoteThunk = createAsyncThunk('note/delete', async (noteId: string) => {
  await noteApi.delete(noteId)
  return noteId
})

export const pinNoteThunk = createAsyncThunk('note/pin', async (noteId: string) => {
  const response = await noteApi.pin(noteId)
  return response.note
})

export const archiveNoteThunk = createAsyncThunk('note/archive', async (noteId: string) => {
  const response = await noteApi.archive(noteId)
  return response.note
})

export const duplicateNoteThunk = createAsyncThunk('note/duplicate', async (noteId: string) => {
  const response = await noteApi.duplicate(noteId)
  return response.note
})

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    setSelectedNoteId: (state, action: PayloadAction<string | null>) => {
      state.selectedNoteId = action.payload
      state.dirty = false
    },
    setNoteSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
    },
    setNoteFilter: (state, action: PayloadAction<NoteFilter>) => {
      state.filter = action.payload
    },
    setNoteDirty: (state, action: PayloadAction<boolean>) => {
      state.dirty = action.payload
    },
    setSavingState: (state, action: PayloadAction<NoteState['saving']>) => {
      state.saving = action.payload
    },
    patchNoteInState: (state, action: PayloadAction<NoteItem>) => {
      state.items = state.items.map((note) => (note.id === action.payload.id ? action.payload : note))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotesThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchNotesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        if (!state.selectedNoteId && action.payload[0]) {
          state.selectedNoteId = action.payload[0].id
        }
      })
      .addCase(fetchNotesThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(createNoteThunk.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
        state.selectedNoteId = action.payload.id
      })
      .addCase(updateNoteThunk.pending, (state) => {
        state.saving = 'saving'
      })
      .addCase(updateNoteThunk.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note.id === action.payload.id ? action.payload : note))
        state.saving = 'saved'
        state.dirty = false
      })
      .addCase(updateNoteThunk.rejected, (state) => {
        state.saving = 'error'
      })
      .addCase(deleteNoteThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((note) => note.id !== action.payload)
        if (state.selectedNoteId === action.payload) {
          state.selectedNoteId = state.items[0]?.id || null
        }
      })
      .addCase(pinNoteThunk.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note.id === action.payload.id ? action.payload : note))
      })
      .addCase(archiveNoteThunk.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note.id === action.payload.id ? action.payload : note))
      })
      .addCase(duplicateNoteThunk.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
      })
  },
})

export const {
  setSelectedNoteId,
  setNoteSearch,
  setNoteFilter,
  setNoteDirty,
  setSavingState,
  patchNoteInState,
} = noteSlice.actions
export default noteSlice.reducer
