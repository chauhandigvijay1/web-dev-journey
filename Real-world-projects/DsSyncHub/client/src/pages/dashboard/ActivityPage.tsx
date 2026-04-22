import { useEffect, useMemo, useState } from 'react'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchActivityThunk } from '../../store/activitySlice'

const ActivityPage = () => {
  const dispatch = useAppDispatch()
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace)
  const { items, loading } = useAppSelector((state) => state.activity)
  const [filter, setFilter] = useState<'today' | 'week' | 'tasks' | 'notes' | 'members'>('week')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    if (activeWorkspaceId) dispatch(fetchActivityThunk(activeWorkspaceId))
  }, [activeWorkspaceId, dispatch])

  const filtered = useMemo(() => {
    const now = new Date()
    return items.filter((item) => {
      const createdAt = new Date(item.createdAt)
      if (filter === 'today') return createdAt.toDateString() === now.toDateString()
      if (filter === 'week') return now.getTime() - createdAt.getTime() <= 7 * 24 * 60 * 60 * 1000
      if (filter === 'tasks') return item.entityType === 'task'
      if (filter === 'notes') return item.entityType === 'note'
      if (filter === 'members') return item.entityType === 'member'
      return true
    })
  }, [items, filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedItems = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Activity is generated per workspace, so select one first to review task movement, edits, and collaboration history." />
  }

  return (
    <section className="space-y-4 pb-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">Activity</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {['today', 'week', 'tasks', 'notes', 'members'].map((value) => (
            <button
              className={`rounded-xl px-3 py-2 text-sm ${filter === value ? 'bg-violet-600 text-white' : 'border border-slate-200 dark:border-slate-700'}`}
              key={value}
              onClick={() => {
                setFilter(value as typeof filter)
                setCurrentPage(1)
              }}
              type="button"
            >
              {value === 'week' ? 'This week' : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" key={index} />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          description="Activity will appear here as tasks move, notes change, and teammates collaborate."
          title="No recent workspace activity"
        />
      ) : (
        <>
          <div className="space-y-3">
            {paginatedItems.map((item) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={item.id}>
              <div className="flex items-center gap-3">
                <Avatar name={item.actor?.fullName || 'Workspace activity'} src={item.actor?.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{item.summary}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{item.entityType}</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </article>
            ))}
          </div>
          <Pagination currentPage={safeCurrentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
        </>
      )}
    </section>
  )
}

export default ActivityPage
