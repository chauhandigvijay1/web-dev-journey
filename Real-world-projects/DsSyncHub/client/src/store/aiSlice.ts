import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { aiApi } from '../services/aiApi'
import type { AIAction, AIHistoryItem } from '../types/ai'

type AIState = {
  loading: boolean
  output: string
  usage: { used: number; limit: number } | null
  history: AIHistoryItem[]
}

const initialState: AIState = {
  loading: false,
  output: '',
  usage: null,
  history: [],
}

export const runAIThunk = createAsyncThunk(
  'ai/run',
  async (payload: { action: AIAction; body: Record<string, unknown>; prompt: string }) => {
    const response = await aiApi.run(payload.action, payload.body)
    return { ...response, action: payload.action, prompt: payload.prompt }
  },
)

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIOutput: (state) => {
      state.output = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runAIThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(runAIThunk.fulfilled, (state, action) => {
        state.loading = false
        state.output = action.payload.output
        state.usage = action.payload.usage || null
        state.history = [
          {
            id: String(Date.now()),
            action: action.payload.action,
            prompt: action.payload.prompt,
            output: action.payload.output,
            createdAt: new Date().toISOString(),
          },
          ...state.history,
        ].slice(0, 20)
      })
      .addCase(runAIThunk.rejected, (state) => {
        state.loading = false
        state.output = 'Unable to process AI request right now. Please retry.'
      })
  },
})

export const { clearAIOutput } = aiSlice.actions
export default aiSlice.reducer
