import { MessageSquareText, Search, ShieldCheck, SquareKanban, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { fetchWorkspaceMembersThunk } from '../../store/workspaceSlice'

const TeamPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { activeWorkspaceId, members } = useAppSelector((state) => state.workspace)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedQuery = useDebouncedValue(query, 250)
  const pageSize = 6

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchWorkspaceMembersThunk(activeWorkspaceId))
    }
  }, [activeWorkspaceId, dispatch])

  const filteredMembers = useMemo(
    () =>
      members.filter((member) => {
        const matchesQuery =
          member.fullName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          member.username.toLowerCase().includes(debouncedQuery.toLowerCase())
        const matchesRole = roleFilter === 'all' || member.role === roleFilter
        return matchesQuery && matchesRole
      }),
    [debouncedQuery, members, roleFilter],
  )
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedMembers = filteredMembers.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="The team directory is workspace-specific, so choose a workspace first to browse members, roles, and quick actions." />
  }

  return (
    <section className="space-y-4 pb-5">
      <div className="flex flex-col gap-3 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Team Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search teammates, filter by role, and jump into action fast.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
            <Search size={15} className="text-slate-400" />
            <input
              className="bg-transparent text-sm outline-none"
              onChange={(event) => {
                setQuery(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search member"
              value={query}
            />
          </div>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm capitalize dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => {
              setRoleFilter(event.target.value)
              setCurrentPage(1)
            }}
            value={roleFilter}
          >
            <option value="all">All roles</option>
            <option value="owner">owner</option>
            <option value="admin">admin</option>
            <option value="member">member</option>
            <option value="viewer">viewer</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {paginatedMembers.map((member) => (
          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={member.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="rounded-2xl" name={member.fullName} size="lg" src={member.avatarUrl} />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{member.fullName}</p>
                  <p className="text-xs text-slate-500">@{member.username}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'}`}>
                {member.status}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>{member.email}</p>
              <p>Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <ShieldCheck className="mr-1 inline" size={12} />
                {member.role}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" onClick={() => navigate(`/chat?dm=${member.userId}`)} type="button">
                <MessageSquareText className="mr-1 inline" size={14} />
                Quick message
              </button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" onClick={() => navigate(`/tasks?create=1&assignee=${member.userId}`)} type="button">
                <SquareKanban className="mr-1 inline" size={14} />
                Assign task
              </button>
            </div>
          </article>
        ))}
        {!filteredMembers.length && (
          <EmptyState
            actionLabel="Invite teammate"
            className="md:col-span-2 xl:col-span-3"
            description={
              query || roleFilter !== 'all'
                ? 'Try a different name, username, or role filter.'
                : 'Invite teammates to start assigning work and messaging directly from the directory.'
            }
            icon={<Users size={24} />}
            onAction={() =>
              navigate(activeWorkspaceId ? `/workspaces/${activeWorkspaceId}?tab=members` : '/workspaces')
            }
            title={query || roleFilter !== 'all' ? 'No members found' : 'No teammates yet'}
          />
        )}
      </div>
      {!!filteredMembers.length && <Pagination currentPage={safeCurrentPage} onPageChange={setCurrentPage} totalPages={totalPages} />}
    </section>
  )
}

export default TeamPage
