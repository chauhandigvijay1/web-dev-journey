import { Sparkles } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { appMenuItems } from './menuConfig'

type AppSidebarProps = {
  collapsed: boolean
  onLogout: () => void
  onNavigate?: () => void
}

const AppSidebar = ({ collapsed, onLogout, onNavigate }: AppSidebarProps) => {
  const navigate = useNavigate()

  return (
    <aside
      className={`flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="mb-4 flex items-center gap-3 rounded-xl px-2 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white shadow-sm">
          <Sparkles size={18} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Workspace OS</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">DsSync Hub</h2>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {appMenuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`
            }
            onClick={onNavigate}
            to={path}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 space-y-3">
        {!collapsed && (
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-violet-100">Upgrade Plan</p>
            <p className="mt-1 text-sm font-medium">Unlock AI automations and advanced analytics.</p>
            <button
              className="mt-3 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30"
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
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
