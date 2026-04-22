import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ToastTone = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

type ToastState = {
  items: ToastItem[]
}

const initialState: ToastState = {
  items: [],
}

const createToastId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    pushToast: {
      prepare: (payload: Omit<ToastItem, 'id'>) => ({
        payload: {
          ...payload,
          id: createToastId(),
        },
      }),
      reducer: (state, action: PayloadAction<ToastItem>) => {
        state.items = [action.payload, ...state.items].slice(0, 5)
      },
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearToasts: (state) => {
      state.items = []
    },
  },
})

export const { pushToast, dismissToast, clearToasts } = toastSlice.actions
export default toastSlice.reducer
