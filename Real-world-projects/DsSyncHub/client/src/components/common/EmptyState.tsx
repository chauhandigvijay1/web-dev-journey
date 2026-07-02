import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
  className?: string
}

const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}: EmptyStateProps) => {
  return (
    <div
      className={`rounded-[28px] border border-dashed border-zinc-300 glass-card p-8 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${className}`.trim()}
    >
      {icon && (
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl glass-card/10 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          {icon}
        </div>
      )}
      <p className="text-lg font-semibold text-white drop-shadow-md">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      {actionLabel && onAction && (
          <button
            className="mt-5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 duration-300"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
