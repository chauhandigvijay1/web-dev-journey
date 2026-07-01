import { Shield, Sparkles } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { appMenuItems } from './menuConfig'
import { useAppSelector } from '../../hooks/redux'

type AppSidebarProps = {
  collapsed: boolean
  onLogout: () => void
  onNavigate?: () => void
}

const AppSidebar = ({ collapsed, onLogout, onNavigate }: AppSidebarProps) => {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  return (
    <aside
      className={`flex h-full flex-col rounded-2xl glass-panel p-3 shadow-sm transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="mb-4 flex items-center gap-3 rounded-xl px-2 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-dark-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
          <Sparkles size={18} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-xs tracking-wide text-brand-400">Workspace OS</p>
            <h2 className="text-lg font-semibold text-white">DsSync Hub</h2>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
        {appMenuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-brand-500/20 text-brand-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.1)]'
                  : 'text-zinc-400 hover:glass-card/10 hover:text-white'
              }`
            }
            onClick={onNavigate}
            to={path}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-brand-500/20 text-brand-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.1)]'
                  : 'text-zinc-400 hover:glass-card/10 hover:text-white'
              }`
            }
            onClick={onNavigate}
          >
            <Shield size={18} />
            {!collapsed && <span>Admin</span>}
          </NavLink>
        )}
      </nav>

      <div className="mt-4 space-y-3">
        {!collapsed && (
          <div className="rounded-2xl glass-card border border-brand-500/30 p-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Upgrade Plan</p>
            <p className="mt-1 text-xs font-medium text-zinc-300">Unlock AI automations and advanced analytics.</p>
            <button
              className="mt-3 w-full rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-dark-950 hover:bg-brand-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
              onClick={() => {
                navigate('/billing')
                onNavigate?.()
              }}
              type="button"
            >
              View plans
            </button>
          </div>
        )}
        <button
          className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-zinc-300 hover:glass-card/10 hover:text-white transition-all"
          onClick={onLogout}
          type="button"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default AppSidebar
