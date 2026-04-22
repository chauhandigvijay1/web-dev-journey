import { Bell, ChevronDown, Menu, Moon, Plus, Search, Sun, UserPlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { logoutThunk } from '../../store/authSlice'
import { fetchNotificationsThunk } from '../../store/notificationSlice'
import { openSearchModal } from '../../store/searchSlice'
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
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
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
    await dispatch(logoutThunk())
    navigate('/login')
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
      <header className="sticky top-0 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 md:gap-3">
          <button
            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => dispatch(toggleMobileSidebar())}
            type="button"
          >
            <Menu size={18} />
          </button>
          <button
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 md:flex"
            onClick={() => dispatch(openSearchModal())}
            type="button"
          >
            <Search size={16} />
            Search...
            <kbd className="rounded border border-slate-200 px-1 text-xs dark:border-slate-600">Ctrl + K</kbd>
          </button>
          <select
            className="min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 sm:max-w-[260px]"
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
            className="hidden rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 sm:block"
            onClick={openMembers}
            type="button"
          >
            <UserPlus className="mr-1 inline" size={16} />
            Invite Member
          </button>
          <div ref={notificationsRef}>
            <button
              className="relative rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => dispatch(toggleNotifications())}
              type="button"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-violet-600 px-1 text-[10px] text-white">{unreadCount}</span>}
            </button>
            {notificationsOpen && <NotificationsDropdown onClose={() => dispatch(closeNotifications())} open={notificationsOpen} />}
          </div>
          <button
            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
            type="button"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div ref={actionsRef}>
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => setQuickActionsOpen((prev) => !prev)}
              type="button"
            >
              <Plus className="mr-1 inline" size={15} />
              <span className="hidden sm:inline">Quick Actions</span>
            </button>
            {quickActionsOpen && (
              <>
                <div className="fixed inset-0 z-20 bg-slate-950/20 md:hidden" onClick={() => setQuickActionsOpen(false)} role="presentation" />
                <div className="fixed inset-x-3 bottom-3 z-30 rounded-[28px] border border-slate-200 bg-white p-2 shadow-lg md:absolute md:inset-auto md:right-14 md:top-12 md:w-64 dark:border-slate-700 dark:bg-slate-900">
                  {[
                    { label: 'New Task', action: () => navigate('/tasks?create=1') },
                    { label: 'New Note', action: () => navigate('/notes?create=1') },
                    { label: 'New Channel', action: () => navigate('/chat?channel=1') },
                    { label: 'Upload File', action: () => navigate('/files?upload=1') },
                    { label: 'Invite Member', action: openMembers },
                    { label: 'Start Meeting', action: () => navigate('/meetings?start=1') },
                  ].map((item) => (
                    <button
                      className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
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
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => setProfileOpen((prev) => !prev)}
              type="button"
            >
              <Avatar name={user?.fullName || 'User'} size="sm" src={user?.avatarUrl} />
              <ChevronDown size={14} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => navigate('/settings')} type="button">
                  Settings
                </button>
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => navigate('/billing')} type="button">
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
