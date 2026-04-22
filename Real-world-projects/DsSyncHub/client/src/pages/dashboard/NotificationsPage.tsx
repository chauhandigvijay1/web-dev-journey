import { Bell, Inbox } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import {
  fetchNotificationsThunk,
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
  removeNotificationThunk,
} from '../../store/notificationSlice'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'system', label: 'System' },
] as const

type FilterKey = (typeof filters)[number]['key']

const NotificationsPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.notification)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    dispatch(fetchNotificationsThunk())
  }, [dispatch])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'unread') return items.filter((item) => !item.isRead)
    if (activeFilter === 'mentions') return items.filter((item) => item.type === 'mention')
    if (activeFilter === 'tasks') return items.filter((item) => item.type === 'task_assigned' || item.type === 'due_reminder')
    if (activeFilter === 'system') return items.filter((item) => item.type === 'system' || item.type === 'payment')
    return items
  }, [activeFilter, items])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedItems = filteredItems.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  return (
    <section className="space-y-4 pb-5">
      <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stay on top of mentions, assignments, billing changes, and workspace activity.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" onClick={() => dispatch(markAllNotificationsReadThunk())} type="button">Mark all read</button>
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" onClick={() => items.filter((item) => item.isRead).forEach((item) => dispatch(removeNotificationThunk(item.id)))} type="button">Clear read items</button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={`rounded-full px-4 py-2 text-sm ${
                activeFilter === filter.key
                  ? 'bg-violet-600 text-white'
                  : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
              }`}
              key={filter.key}
              onClick={() => {
                setActiveFilter(filter.key)
                setCurrentPage(1)
              }}
              type="button"
            >
              {filter.label}
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
      ) : !filteredItems.length ? (
        <EmptyState
          actionLabel="Open dashboard"
          description={
            activeFilter === 'all'
              ? 'You are caught up for now. New mentions, tasks, and billing updates will appear here.'
              : 'Try another filter or come back after more workspace activity is generated.'
          }
          icon={activeFilter === 'all' ? <Inbox size={24} /> : <Bell size={24} />}
          onAction={() => navigate('/dashboard')}
          title={activeFilter === 'all' ? 'No notifications yet' : 'No notifications in this filter'}
        />
      ) : (
        <>
          <div className="space-y-3">
            {paginatedItems.map((item) => (
              <article className={`rounded-[28px] border bg-white p-4 shadow-sm dark:bg-slate-900 ${
                item.isRead ? 'border-slate-200 dark:border-slate-800' : 'border-violet-200 dark:border-violet-500/20'
              }`} key={item.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      {!item.isRead && <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">New</span>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.link && <Link className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white dark:bg-white dark:text-slate-900" to={item.link}>Open</Link>}
                      {!item.isRead && <button className="rounded-full border border-slate-200 px-4 py-2 text-xs dark:border-slate-700" onClick={() => dispatch(markNotificationReadThunk(item.id))} type="button">Mark read</button>}
                      <button className="rounded-full border border-rose-200 px-4 py-2 text-xs text-rose-600 dark:border-rose-900/40" onClick={() => dispatch(removeNotificationThunk(item.id))} type="button">Delete</button>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-500 dark:bg-slate-800 dark:text-slate-300">{item.type.replace('_', ' ')}</span>
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

export default NotificationsPage
