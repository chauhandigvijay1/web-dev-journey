import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/common/ConfirmModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { api } from '../services/api'
import { pushToast } from '../store/toastSlice'

interface User {
  _id: string
  fullName: string
  email: string
  username: string
  role: string
  provider: string
  createdAt: string
}

interface Workspace {
  _id: string
  name: string
  slug: string
  plan: string
  owner: { fullName: string; email: string }
  membersCount: number
  createdAt: string
}

interface Stats {
  userCount: number
  workspaceCount: number
  inviteCount: number
  proCount: number
}

const AdminPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [tab, setTab] = useState<'stats' | 'users' | 'workspaces'>('stats')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [search, setSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [workspacePage, setWorkspacePage] = useState(1)
  const [workspaceTotal, setWorkspaceTotal] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    fetchStats()
    fetchUsers()
    fetchWorkspaces()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats')
      if (data.success) setStats(data.stats)
    } catch {
      dispatch(pushToast({ title: 'Failed to load stats', description: 'Could not fetch admin statistics.', tone: 'error' }))
    }
  }

  const fetchUsers = async (page = 1) => {
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: 20, search } })
      if (data.success) { setUsers(data.users); setUserTotal(data.total); setUserPage(data.page) }
    } catch {
      dispatch(pushToast({ title: 'Failed to load users', description: 'Could not fetch user list.', tone: 'error' }))
    }
  }

  const fetchWorkspaces = async (page = 1) => {
    try {
      const { data } = await api.get('/admin/workspaces', { params: { page, limit: 20, search } })
      if (data.success) { setWorkspaces(data.workspaces); setWorkspaceTotal(data.total); setWorkspacePage(data.page) }
    } catch {
      dispatch(pushToast({ title: 'Failed to load workspaces', description: 'Could not fetch workspace list.', tone: 'error' }))
    }
  }

  const updateRole = async (userId: string, role: string) => {
    try {
      setLoading(true)
      await api.patch(`/admin/users/${userId}/role`, { role })
      dispatch(pushToast({ title: 'Role updated', description: `User role changed to ${role}.`, tone: 'success' }))
      fetchUsers(userPage)
    } catch {
      dispatch(pushToast({ title: 'Failed to update role', description: 'Could not change user role.', tone: 'error' }))
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true)
      await api.delete(`/admin/users/${userId}`)
      dispatch(pushToast({ title: 'User deleted', description: 'User and their memberships removed.', tone: 'success' }))
      fetchUsers(userPage)
    } catch {
      dispatch(pushToast({ title: 'Failed to delete user', description: 'Could not remove user.', tone: 'error' }))
    } finally {
      setLoading(false)
      setDeleteTarget(null)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <section className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>

      <div className="mb-6 flex gap-2">
        {(['stats', 'users', 'workspaces'] as const).map((t) => (
          <button
            className={`rounded-lg border px-5 py-2 text-sm font-medium transition ${
              tab === t
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-white/10 text-zinc-300 hover:bg-zinc-800 dark:border-zinc-700'
            }`}
            key={t}
            onClick={() => setTab(t)}
            type="button"
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Users', value: stats.userCount, color: 'text-indigo-500' },
            { label: 'Active Workspaces', value: stats.workspaceCount, color: 'text-emerald-500' },
            { label: 'Pending Invites', value: stats.inviteCount, color: 'text-amber-500' },
            { label: 'Pro Workspaces', value: stats.proCount, color: 'text-rose-500' },
          ].map((card) => (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6" key={card.label}>
              <p className="mb-2 text-sm text-zinc-400">{card.label}</p>
              <p className={`text-4xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div>
          <div className="mb-4 flex gap-3">
            <label className="sr-only" htmlFor="admin-user-search">Search users</label>
            <input
              className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none dark:border-zinc-700"
              id="admin-user-search"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              placeholder="Search users..."
              value={search}
            />
            <button
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white"
              onClick={() => { setUserPage(1); fetchUsers(1) }}
              type="button"
            >
              Search
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 dark:border-zinc-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-800/50 text-left dark:border-zinc-700">
                  <th className="px-3 py-3 font-medium text-zinc-400">Name</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Email</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Username</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Role</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Provider</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr className="border-b border-white/5 hover:bg-zinc-800/30 dark:border-zinc-800" key={u._id}>
                    <td className="max-w-48 truncate px-3 py-3">{u.fullName}</td>
                    <td className="max-w-56 truncate px-3 py-3 text-zinc-400">{u.email}</td>
                    <td className="max-w-44 truncate px-3 py-3 text-zinc-400">{u.username}</td>
                    <td className="px-3 py-3">
                      <label className="sr-only" htmlFor={`admin-user-role-${u._id}`}>Role for {u.fullName}</label>
                      <select
                        className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs dark:border-zinc-700"
                        id={`admin-user-role-${u._id}`}
                        onChange={(e) => updateRole(u._id, e.target.value)}
                        value={u.role}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-500">{u.provider}</td>
                    <td className="px-3 py-3">
                      <button
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs text-white hover:bg-rose-700 disabled:opacity-60"
                        disabled={loading}
                        onClick={() => setDeleteTarget(u._id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userTotal > 20 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700"
                disabled={userPage <= 1}
                onClick={() => fetchUsers(userPage - 1)}
                type="button"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-400">Page {userPage} of {Math.ceil(userTotal / 20)}</span>
              <button
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700"
                disabled={userPage >= Math.ceil(userTotal / 20)}
                onClick={() => fetchUsers(userPage + 1)}
                type="button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'workspaces' && (
        <div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 dark:border-zinc-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-800/50 text-left dark:border-zinc-700">
                  <th className="px-3 py-3 font-medium text-zinc-400">Name</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Slug</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Plan</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Owner</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Members</th>
                  <th className="px-3 py-3 font-medium text-zinc-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((w) => (
                  <tr className="border-b border-white/5 hover:bg-zinc-800/30 dark:border-zinc-800" key={w._id}>
                    <td className="max-w-56 truncate px-3 py-3 font-medium">{w.name}</td>
                    <td className="max-w-48 truncate px-3 py-3 text-zinc-400">{w.slug}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${w.plan === 'pro' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {w.plan}
                      </span>
                    </td>
                    <td className="max-w-48 truncate px-3 py-3 text-zinc-400">{w.owner?.fullName || 'Unknown'}</td>
                    <td className="px-3 py-3 text-zinc-400">{w.membersCount}</td>
                    <td className="px-3 py-3 text-zinc-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {workspaceTotal > 20 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700"
                disabled={workspacePage <= 1}
                onClick={() => { setWorkspacePage(workspacePage - 1); fetchWorkspaces(workspacePage - 1) }}
                type="button"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-400">Page {workspacePage} of {Math.ceil(workspaceTotal / 20)}</span>
              <button
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700"
                disabled={workspacePage >= Math.ceil(workspaceTotal / 20)}
                onClick={() => { setWorkspacePage(workspacePage + 1); fetchWorkspaces(workspacePage + 1) }}
                type="button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          confirmLabel="Delete"
          description="This will permanently delete the user and all their memberships. This action cannot be undone."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteUser(deleteTarget)}
          open
          title="Delete user"
          variant="danger"
        />
      )}
    </section>
  )
}

export default AdminPage
