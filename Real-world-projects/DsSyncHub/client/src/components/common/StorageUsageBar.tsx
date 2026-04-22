import type { StorageUsage } from '../../types/file'

type StorageUsageBarProps = {
  usage: StorageUsage
  compact?: boolean
}

const StorageUsageBar = ({ usage, compact = false }: StorageUsageBarProps) => {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${compact ? 'p-3' : 'p-4'} dark:border-slate-700 dark:bg-slate-900`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">Storage usage</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {usage.usedMb.toFixed(2)} MB of {usage.limitMb.toFixed(0)} MB used
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {usage.percentUsed}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${usage.percentUsed >= 90 ? 'bg-rose-500' : usage.percentUsed >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.max(6, usage.percentUsed)}%` }}
        />
      </div>
    </div>
  )
}

export default StorageUsageBar
