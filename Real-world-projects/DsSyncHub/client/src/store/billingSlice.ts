import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { billingApi } from '../services/billingApi'
import type { BillingCurrent, BillingHistoryItem, SubscriptionPlan } from '../types/billing'

type BillingState = {
  current: BillingCurrent | null
  history: BillingHistoryItem[]
  loading: boolean
}

const initialState: BillingState = {
  current: null,
  history: [],
  loading: false,
}

export const fetchBillingCurrentThunk = createAsyncThunk('billing/current', async (workspaceId: string) => {
  const response = await billingApi.current(workspaceId)
  return response.current
})

export const fetchBillingHistoryThunk = createAsyncThunk('billing/history', async (workspaceId: string) => {
  const response = await billingApi.history(workspaceId)
  return response.history
})

export const checkoutBillingThunk = createAsyncThunk(
  'billing/checkout',
  async (payload: { workspaceId: string; plan: SubscriptionPlan }, { dispatch }) => {
    await billingApi.checkout(payload.workspaceId, payload.plan)
    await dispatch(fetchBillingCurrentThunk(payload.workspaceId))
    await dispatch(fetchBillingHistoryThunk(payload.workspaceId))
  },
)

export const cancelBillingThunk = createAsyncThunk(
  'billing/cancel',
  async (workspaceId: string, { dispatch }) => {
    await billingApi.cancel(workspaceId)
    await dispatch(fetchBillingCurrentThunk(workspaceId))
  },
)

export const resumeBillingThunk = createAsyncThunk(
  'billing/resume',
  async (workspaceId: string, { dispatch }) => {
    await billingApi.resume(workspaceId)
    await dispatch(fetchBillingCurrentThunk(workspaceId))
  },
)

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillingCurrentThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBillingCurrentThunk.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchBillingCurrentThunk.rejected, (state) => {
        state.loading = false
      })
      .addCase(fetchBillingHistoryThunk.fulfilled, (state, action) => {
        state.history = action.payload
      })
  },
})

export default billingSlice.reducer
