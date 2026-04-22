import { combineReducers, configureStore } from '@reduxjs/toolkit'
import activityReducer from './activitySlice'
import aiReducer from './aiSlice'
import authReducer, { logoutThunk } from './authSlice'
import billingReducer from './billingSlice'
import calendarReducer from './calendarSlice'
import chatReducer from './chatSlice'
import fileReducer from './fileSlice'
import meetingReducer from './meetingSlice'
import noteReducer from './noteSlice'
import notificationReducer from './notificationSlice'
import searchReducer from './searchSlice'
import taskReducer from './taskSlice'
import toastReducer from './toastSlice'
import uiReducer from './uiSlice'
import workspaceReducer from './workspaceSlice'

const appReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  ui: uiReducer,
  workspace: workspaceReducer,
  task: taskReducer,
  toast: toastReducer,
  note: noteReducer,
  notification: notificationReducer,
  activity: activityReducer,
  calendar: calendarReducer,
  ai: aiReducer,
  search: searchReducer,
  billing: billingReducer,
  file: fileReducer,
  meeting: meetingReducer,
})

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: Parameters<typeof appReducer>[1],
) => {
  if (action.type === logoutThunk.fulfilled.type || action.type === logoutThunk.rejected.type) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('dssync-active-workspace')
    }

    return appReducer(undefined, action)
  }

  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
