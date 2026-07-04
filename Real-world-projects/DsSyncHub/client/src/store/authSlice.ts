import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '../services/authApi'
import { userApi } from '../services/userApi'
import type { AuthUser } from '../types/auth'

type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  initialized: boolean
  token: string | null
}

const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem('dssync-token')
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
  token: getInitialToken(),
}

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const response = await authApi.getMe()
  return { user: response.user }
})

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string; rememberMe?: boolean }) => {
    const response = await authApi.login(payload)
    return { user: response.user, accessToken: response.accessToken }
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
    return { user: response.user, accessToken: response.accessToken }
  },
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authApi.logout()
})

export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (payload: { idToken: string }) => {
    const response = await authApi.googleLogin(payload)
    return { user: response.user, accessToken: response.accessToken }
  },
)

export const googleRegisterThunk = createAsyncThunk(
  'auth/googleRegister',
  async (payload: { idToken: string }) => {
    const response = await authApi.googleLogin(payload)
    return { user: response.user, accessToken: response.accessToken }
  },
)

export const deleteMyAccountThunk = createAsyncThunk('auth/deleteMyAccount', async (_, { dispatch }) => {
  const response = await userApi.deleteMyAccount()
  dispatch(clearCredentials())
  window.location.href = '/login'
  return response
})

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
      state.token = null
      localStorage.removeItem('dssync-token')
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
        state.user = action.payload.user
        state.isAuthenticated = true
        const savedToken = localStorage.getItem('dssync-token')
        if (savedToken) {
          state.token = savedToken
        }
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
        state.user = action.payload.user
        state.isAuthenticated = true
        if (action.payload.accessToken) {
          state.token = action.payload.accessToken
          localStorage.setItem('dssync-token', action.payload.accessToken)
        }
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
        state.user = action.payload.user
        state.isAuthenticated = true
        if (action.payload.accessToken) {
          state.token = action.payload.accessToken
          localStorage.setItem('dssync-token', action.payload.accessToken)
        }
      })
      .addCase(registerThunk.rejected, (state) => {
        state.loading = false
        state.initialized = true
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.initialized = true
        state.user = null
        state.isAuthenticated = false
        state.token = null
        localStorage.removeItem('dssync-token')
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.initialized = true
        state.user = null
        state.isAuthenticated = false
        state.token = null
        localStorage.removeItem('dssync-token')
      })
      .addCase(googleLoginThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload.user
        state.isAuthenticated = true
        if (action.payload.accessToken) {
          state.token = action.payload.accessToken
          localStorage.setItem('dssync-token', action.payload.accessToken)
        }
      })
      .addCase(googleLoginThunk.rejected, (state) => {
        state.loading = false
        state.initialized = true
      })
      .addCase(googleRegisterThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(googleRegisterThunk.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload.user
        state.isAuthenticated = true
        if (action.payload.accessToken) {
          state.token = action.payload.accessToken
          localStorage.setItem('dssync-token', action.payload.accessToken)
        }
      })
      .addCase(googleRegisterThunk.rejected, (state) => {
        state.loading = false
        state.initialized = true
      })
    },
})

export const { setCredentials, clearCredentials, setLoading, setInitialized } =
  authSlice.actions
export default authSlice.reducer
