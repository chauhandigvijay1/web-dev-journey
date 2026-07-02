import { Bell, ChevronDown, Menu, Moon, Plus, Search, Sun, UserPlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { logoutThunk } from '../../store/authSlice'
import { fetchNotificationsThunk } from '../../store/notificationSlice'
import { openSearchModal } from '../../store/searchSlice'
import { pushToast } from '../../store/toastSlice'
import { getApiErrorMessage } from '../../utils/errors'
import {
  closeNotifications,
  setTheme,
  toggleMobileSidebar,
  toggleNotifications,
} from '../../store/uiSlice'
import { setActiveWorkspaceId } from '../../store/workspaceSlice'
import NotificationsDropdown from './NotificationsDropdown'
import SearchModal from './SearchModal'

const TopNavbar = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { theme, notificationsOpen } = useAppSelector((state) => state.ui)
  const { unreadCount } = useAppSelector((state) => state.notification)
  const { items: workspaces, activeWorkspaceId } = useAppSelector((state) => state.workspace)
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement | null>(null)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        dispatch(openSearchModal())
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchNotificationsThunk())
  }, [dispatch])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (quickActionsOpen && actionsRef.current && !actionsRef.current.contains(target)) {
        setQuickActionsOpen(false)
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false)
      }
      if (notificationsOpen && notificationsRef.current && !notificationsRef.current.contains(target)) {
        dispatch(closeNotifications())
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setQuickActionsOpen(false)
      setProfileOpen(false)
      dispatch(closeNotifications())
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [dispatch, notificationsOpen, profileOpen, quickActionsOpen])

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap()
      navigate('/login')
    } catch (error) {
      dispatch(pushToast({ title: 'Logout failed', description: getApiErrorMessage(error, 'Could not log out. Please try again.'), tone: 'error' }))
    }
  }

  const openMembers = () => {
    if (activeWorkspaceId) {
      navigate(`/workspaces/${activeWorkspaceId}?tab=members`)
      return
    }
    navigate('/workspaces')
  }

  return (
    <>
      <header className="sticky top-0 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl glass-panel p-3 text-zinc-200">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 md:gap-3">
          <button
            className="rounded-xl border border-white/10 p-2 hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800 lg:hidden"
            onClick={() => dispatch(toggleMobileSidebar())}
            type="button"
          >
            <Menu size={18} />
          </button>
          <button
            className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-500 hover:glass-card/10 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 md:flex"
            onClick={() => dispatch(openSearchModal())}
            type="button"
          >
            <Search size={16} />
            Search...
            <kbd className="rounded border border-white/10 px-1 text-xs dark:border-zinc-600">Ctrl + K</kbd>
          </button>
          <select
            className="min-w-0 max-w-full rounded-xl border border-white/10 bg-black/20 backdrop-blur-md px-3 py-2 text-sm text-zinc-200 sm:max-w-[260px] custom-select"
            onChange={(event) => dispatch(setActiveWorkspaceId(event.target.value))}
            value={activeWorkspaceId || ''}
          >
            {!workspaces.length && <option value="">No workspaces</option>}
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          <button
            className="hidden rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 duration-300 sm:block"
            onClick={openMembers}
            type="button"
          >
            <UserPlus className="mr-1 inline" size={16} />
            Invite Member
          </button>
          <button
            className="rounded-xl border border-white/10 p-2 hover:glass-card/10 md:hidden dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => dispatch(openSearchModal())}
            type="button"
          >
            <Search size={18} />
          </button>
          <div ref={notificationsRef}>
            <button
              className="relative rounded-xl border border-white/10 p-2 hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
              onClick={() => dispatch(toggleNotifications())}
              type="button"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-brand-500 px-1 text-[10px] text-white">{unreadCount}</span>}
            </button>
            {notificationsOpen && <NotificationsDropdown onClose={() => dispatch(closeNotifications())} open={notificationsOpen} />}
          </div>
          <button
            className="rounded-xl border border-white/10 p-2 hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
            type="button"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div ref={actionsRef}>
            <button
              className="flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1.5 hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
              onClick={() => setQuickActionsOpen((prev) => !prev)}
              type="button"
            >
              <Plus className="mr-1 inline" size={15} />
              <span className="hidden sm:inline">Quick Actions</span>
            </button>
            {quickActionsOpen && (
              <>
                <div className="fixed inset-0 z-20 bg-zinc-950/20 md:hidden" onClick={() => setQuickActionsOpen(false)} role="presentation" />
                <div className="fixed inset-x-3 bottom-3 z-30 rounded-[28px] glass-card p-2 md:absolute md:inset-auto md:right-14 md:top-12 md:w-64">
                  {[
                    { label: 'New Task', action: () => navigate('/tasks?create=1') },
                    { label: 'New Note', action: () => navigate('/notes?create=1') },
                    { label: 'New Channel', action: () => navigate('/chat?channel=1') },
                    { label: 'Upload File', action: () => navigate('/files?upload=1') },
                    { label: 'Invite Member', action: openMembers },
                    { label: 'Start Meeting', action: () => navigate('/meetings?start=1') },
                  ].map((item) => (
                    <button
                      className="w-full rounded-xl px-3 py-2 text-left text-sm hover:glass-card/10 dark:hover:bg-zinc-800"
                      key={item.label}
                      onClick={() => {
                        setQuickActionsOpen(false)
                        item.action()
                      }}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div ref={profileRef}>
            <button
              className="flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1.5 hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
              onClick={() => setProfileOpen((prev) => !prev)}
              type="button"
            >
              <Avatar name={user?.fullName || 'User'} size="sm" src={user?.avatarUrl} />
              <ChevronDown size={14} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 z-30 w-44 rounded-xl glass-card p-1">
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:glass-card/10 dark:hover:bg-zinc-800" onClick={() => navigate('/settings')} type="button">
                  Settings
                </button>
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:glass-card/10 dark:hover:bg-zinc-800" onClick={() => navigate('/billing')} type="button">
                  Billing
                </button>
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <SearchModal />
    </>
  )
}

export default TopNavbar
