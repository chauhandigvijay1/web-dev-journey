import { useEffect } from 'react'
import ToastViewport from './components/common/ToastViewport'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import AppRoutes from './routes/AppRoutes'
import { initializeAuth } from './store/authSlice'
import { fetchWorkspacesThunk } from './store/workspaceSlice'

const App = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.ui.theme)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const resolvedTheme = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    }

    applyTheme()
    mediaQuery.addEventListener('change', applyTheme)
    window.localStorage.setItem('dssync-theme', theme)

    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [theme])

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWorkspacesThunk())
    }
  }, [dispatch, isAuthenticated])

  return (
    <>
      <AppRoutes />
      <ToastViewport />
    </>
  )
}

export default App
