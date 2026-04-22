import { Bell, Megaphone, MessageSquare, Receipt, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import {
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
} from '../../store/notificationSlice'

type NotificationsDropdownProps = {
  open: boolean
  onClose: () => void
}

const NotificationsDropdown = ({ open, onClose }: NotificationsDropdownProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state) => state.notification)
  if (!open) {
    return null
  }

  const iconByType = {
    task_assigned: Bell,
    mention: MessageSquare,
    invite: UserPlus,
    due_reminder: Bell,
    note_shared: Megaphone,
    payment: Receipt,
    system: Bell,
  }

  return (
    <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold text-slate-900 dark:text-white">Notifications</p>
        <button className="text-xs text-violet-600 hover:underline" onClick={() => dispatch(markAllNotificationsReadThunk())} type="button">
          Mark all read
        </button>
      </div>
      <div className="space-y-1">
        {!items.length ? <p className="rounded-xl px-3 py-2 text-sm text-slate-500">You&apos;re all caught up.</p> : items.slice(0, 6).map((item) => {
          const Icon = iconByType[item.type]
          return (
          <button
            className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
            key={item.id}
            onClick={() => {
              dispatch(markNotificationReadThunk(item.id))
              if (item.link) {
                navigate(item.link)
              }
              onClose()
            }}
            type="button"
          >
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              <Icon className="mr-1 inline" size={13} />
              {item.title} {!item.isRead && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-violet-600" />}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.message}</p>
            <p className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
          </button>
          )})}
      </div>
      <Link className="mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2 text-center text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" onClick={onClose} to="/notifications">
        View all notifications
      </Link>
    </div>
  )
}

export default NotificationsDropdown
