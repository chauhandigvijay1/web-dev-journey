import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useNavigate, Outlet } from 'react-router-dom'
import AppSidebar from '../components/navigation/AppSidebar'
import TopNavbar from '../components/navigation/TopNavbar'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { logoutThunk } from '../store/authSlice'
import {
  closeMobileSidebar,
  toggleSidebarCollapsed,
} from '../store/uiSlice'

const DashboardLayout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { sidebarCollapsed, mobileSidebarOpen } = useAppSelector((state) => state.ui)

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 dark:bg-slate-950 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1500px] gap-4">
        <div className="hidden lg:block">
          <AppSidebar collapsed={sidebarCollapsed} onLogout={handleLogout} />
        </div>

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            onClick={() => dispatch(closeMobileSidebar())}
            role="presentation"
          >
            <div className="h-full w-72 p-3" onClick={(event) => event.stopPropagation()} role="presentation">
              <AppSidebar
                collapsed={false}
                onLogout={handleLogout}
                onNavigate={() => dispatch(closeMobileSidebar())}
              />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <TopNavbar />
          <button
            className="mb-3 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 lg:inline-flex"
            onClick={() => dispatch(toggleSidebarCollapsed())}
            type="button"
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
