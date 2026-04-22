import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '../services/authApi'
import type { AuthUser } from '../types/auth'

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
}

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const response = await authApi.getMe()
  return response.user
})

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string; rememberMe?: boolean }) => {
    const response = await authApi.login(payload)
    return response.user
  },
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: {
    fullName: string
    username: string
    email: string
    phone?: string
    password: string
    confirmPassword: string
  }) => {
    const response = await authApi.register(payload)
    return response.user
  },
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authApi.logout()
})

export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (payload: { idToken: string }) => {
    const response = await authApi.googleLogin(payload)
    return response.user
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearCredentials: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.initialized = true
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginThunk.rejected, (state) => {
        state.loading = false
        state.initialized = true
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(registerThunk.rejected, (state) => {
        state.loading = false
        state.initialized = true
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.initialized = true
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.initialized = true
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(googleLoginThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(googleLoginThunk.rejected, (state) => {
        state.loading = false
        state.initialized = true
      })
    },
})

export const { setCredentials, clearCredentials, setLoading, setInitialized } =
  authSlice.actions
export default authSlice.reducer
