import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  googleLoginThunk,
  initializeAuth,
  loginThunk,
  registerThunk,
  setCredentials,
} from './authSlice'

type UIState = {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  notificationsOpen: boolean
}

const getInitialTheme = (): UIState['theme'] => {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const savedTheme = window.localStorage.getItem('dssync-theme')
  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
    return savedTheme
  }

  return 'system'
}

const initialState: UIState = {
  theme: getInitialTheme(),
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  notificationsOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen
    },
    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen
    },
    closeNotifications: (state) => {
      state.notificationsOpen = false
    },
  },
  extraReducers: (builder) => {
    const syncThemeFromUser = (
      state: UIState,
      theme?: UIState['theme'],
    ) => {
      if (theme) {
        state.theme = theme
      }
    }

    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        syncThemeFromUser(state, action.payload.appearance?.theme)
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        syncThemeFromUser(state, action.payload.appearance?.theme)
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        syncThemeFromUser(state, action.payload.appearance?.theme)
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        syncThemeFromUser(state, action.payload.appearance?.theme)
      })
      .addCase(setCredentials, (state, action) => {
        syncThemeFromUser(state, action.payload.appearance?.theme)
      })
  },
})

export const {
  setTheme,
  toggleSidebarCollapsed,
  toggleMobileSidebar,
  closeMobileSidebar,
  toggleNotifications,
  closeNotifications,
} = uiSlice.actions
export default uiSlice.reducer
