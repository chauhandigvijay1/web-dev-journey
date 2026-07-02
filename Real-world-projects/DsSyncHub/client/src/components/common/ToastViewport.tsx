import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { dismissToast } from '../../store/toastSlice'

const toneClasses = {
  success: {
    card: 'border-emerald-200 bg-emerald-50/95 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-50',
    icon: 'text-emerald-600 dark:text-emerald-300',
  },
  error: {
    card: 'border-rose-200 bg-rose-50/95 text-rose-950 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-50',
    icon: 'text-rose-600 dark:text-rose-300',
  },
  info: {
    card: 'border-white/10 glass-card/95 text-white dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-50',
    icon: 'text-brand-500 dark:text-brand-300',
  },
} as const

const toneIcon = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const

const ToastItemView = ({
  id,
  title,
  description,
  tone,
}: {
  id: string
  title: string
  description?: string
  tone: keyof typeof toneClasses
}) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch(dismissToast(id))
    }, 4200)

    return () => window.clearTimeout(timer)
  }, [dispatch, id])

  const Icon = toneIcon[tone]

  return (
    <article
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3 shadow-lg backdrop-blur ${toneClasses[tone].card}`}
      role="status"
    >
      <Icon className={`mt-0.5 shrink-0 ${toneClasses[tone].icon}`} size={18} />
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold">{title}</p>
        {description && <p className="mt-1 break-words text-xs leading-5 opacity-80">{description}</p>}
      </div>
      <button
        aria-label="Dismiss notification"
        className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:glass-card/10"
        onClick={() => dispatch(dismissToast(id))}
        type="button"
      >
        <X size={14} />
      </button>
    </article>
  )
}

const ToastViewport = () => {
  const items = useAppSelector((state) => state.toast.items)

  if (!items.length) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[70] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-[360px]">
      {items.map((item) => (
        <ToastItemView
          description={item.description}
          id={item.id}
          key={item.id}
          title={item.title}
          tone={item.tone}
        />
      ))}
    </div>
  )
}

export default ToastViewport
