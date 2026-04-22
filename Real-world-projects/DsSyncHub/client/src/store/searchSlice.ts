import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { searchApi } from '../services/searchApi'
import type { SearchResults } from '../types/search'

type SearchState = {
  open: boolean
  query: string
  loading: boolean
  results: SearchResults
  recent: string[]
}

const getRecent = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem('dssync-recent-searches') || '[]')
  } catch {
    return []
  }
}

const initialState: SearchState = {
  open: false,
  query: '',
  loading: false,
  results: { tasks: [], notes: [], messages: [], members: [], files: [] },
  recent: getRecent(),
}

export const runSearchThunk = createAsyncThunk(
  'search/run',
  async (payload: { workspaceId: string; q: string }) => {
    const response = await searchApi.query(payload.workspaceId, payload.q)
    return response.results
  },
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    openSearchModal: (state) => {
      state.open = true
    },
    closeSearchModal: (state) => {
      state.open = false
      state.query = ''
      state.loading = false
      state.results = initialState.results
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    clearSearchResults: (state) => {
      state.loading = false
      state.results = initialState.results
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const value = action.payload.trim()
      if (!value) return
      state.recent = [value, ...state.recent.filter((item) => item !== value)].slice(0, 8)
      window.localStorage.setItem('dssync-recent-searches', JSON.stringify(state.recent))
    },
    clearRecentSearches: (state) => {
      state.recent = []
      window.localStorage.removeItem('dssync-recent-searches')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSearchThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(runSearchThunk.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload
      })
      .addCase(runSearchThunk.rejected, (state) => {
        state.loading = false
      })
  },
})

export const {
  openSearchModal,
  closeSearchModal,
  setSearchQuery,
  clearSearchResults,
  addRecentSearch,
  clearRecentSearches,
} = searchSlice.actions
export default searchSlice.reducer
