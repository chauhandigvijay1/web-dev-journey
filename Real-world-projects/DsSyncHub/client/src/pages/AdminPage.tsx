import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux'
import { api } from '../services/api'

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
  const user = useAppSelector((state) => state.auth.user)
  const [tab, setTab] = useState<'stats' | 'users' | 'workspaces'>('stats')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [search, setSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [, setWorkspacePage] = useState(1)
  const [, setWorkspaceTotal] = useState(0)

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
    } catch { /* ignore */ }
  }

  const fetchUsers = async (page = 1) => {
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: 20, search } })
      if (data.success) { setUsers(data.users); setUserTotal(data.total); setUserPage(data.page) }
    } catch { /* ignore */ }
  }

  const fetchWorkspaces = async (page = 1) => {
    try {
      const { data } = await api.get('/admin/workspaces', { params: { page, limit: 20, search } })
      if (data.success) { setWorkspaces(data.workspaces); setWorkspaceTotal(data.total); setWorkspacePage(data.page) }
    } catch { /* ignore */ }
  }

  const updateRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role })
      fetchUsers(userPage)
    } catch { /* ignore */ }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user and all their memberships?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      fetchUsers(userPage)
    } catch { /* ignore */ }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Admin Panel</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['stats', 'users', 'workspaces'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              background: tab === t ? '#4f46e5' : '#fff',
              color: tab === t ? '#fff' : '#374151',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Users', value: stats.userCount, color: '#4f46e5' },
            { label: 'Active Workspaces', value: stats.workspaceCount, color: '#059669' },
            { label: 'Pending Invites', value: stats.inviteCount, color: '#d97706' },
            { label: 'Pro Workspaces', value: stats.proCount, color: '#dc2626' },
          ].map((card) => (
            <div key={card.label} style={{ padding: 24, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
            />
            <button onClick={() => fetchUsers()} style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Search</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Email</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Username</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Role</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Provider</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 12px' }}>{u.fullName}</td>
                    <td style={{ padding: '10px 12px' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>{u.username}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u._id, e.target.value)}
                        style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4 }}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{u.provider}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => deleteUser(u._id)} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userTotal > 20 && (
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
              {userPage > 1 && <button onClick={() => fetchUsers(userPage - 1)} style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Previous</button>}
              <span style={{ padding: '6px 14px' }}>Page {userPage} of {Math.ceil(userTotal / 20)}</span>
              {userPage < Math.ceil(userTotal / 20) && <button onClick={() => fetchUsers(userPage + 1)} style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>Next</button>}
            </div>
          )}
        </div>
      )}

      {tab === 'workspaces' && (
        <div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Slug</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Plan</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Owner</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Members</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e5e7eb' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((w) => (
                  <tr key={w._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{w.name}</td>
                    <td style={{ padding: '10px 12px' }}>{w.slug}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: w.plan === 'pro' ? '#fef3c7' : '#f3f4f6', color: w.plan === 'pro' ? '#92400e' : '#6b7280' }}>{w.plan}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{w.owner?.fullName || 'Unknown'}</td>
                    <td style={{ padding: '10px 12px' }}>{w.membersCount}</td>
                    <td style={{ padding: '10px 12px' }}>{new Date(w.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage
