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
    <div className="relative min-h-screen text-zinc-100 selection:bg-brand-500/30 overflow-hidden">
      <div className="cinematic-bg" />
      <div className="absolute inset-0 cinematic-overlay-heavy -z-10" />
      
      <div className="mx-auto flex h-screen max-w-[1500px] gap-4 p-3 md:p-4 relative z-10">
        <div className="hidden lg:block">
          <AppSidebar collapsed={sidebarCollapsed} onLogout={handleLogout} />
        </div>

        <div
          className={`fixed inset-0 z-40 bg-zinc-900/50 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
            mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => dispatch(closeMobileSidebar())}
          role="presentation"
        >
          <div
            className={`h-full w-72 p-3 transition-transform duration-300 ease-in-out ${
              mobileSidebarOpen ? 'tranzinc-x-0' : '-tranzinc-x-full'
            }`}
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <AppSidebar
              collapsed={false}
              onLogout={handleLogout}
              onNavigate={() => dispatch(closeMobileSidebar())}
            />
          </div>
        </div>

        <main className="min-w-0 flex-1 flex flex-col h-full overflow-hidden">
          <TopNavbar />
          <button
            className="mb-3 hidden items-center gap-2 rounded-xl glass-card px-4 py-2 text-sm font-medium hover:bg-zinc-800/80 lg:inline-flex w-fit transition-all text-zinc-300 hover:text-white"
            onClick={() => dispatch(toggleSidebarCollapsed())}
            type="button"
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
          </button>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
