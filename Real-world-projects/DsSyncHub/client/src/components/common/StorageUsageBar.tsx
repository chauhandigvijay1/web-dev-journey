import type { StorageUsage } from '../../types/file'

type StorageUsageBarProps = {
  usage: StorageUsage
  compact?: boolean
}

const StorageUsageBar = ({ usage, compact = false }: StorageUsageBarProps) => {
  return (
    <div className={`rounded-2xl border border-white/10 glass-card ${compact ? 'p-3' : 'p-4'} dark:border-zinc-700 dark:bg-zinc-900`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white font-semibold drop-shadow-md">Storage usage</p>
          <p className="text-xs text-zinc-400">
            {usage.usedMb.toFixed(2)} MB of {usage.limitMb.toFixed(0)} MB used
          </p>
        </div>
        <span className="rounded-full glass-card/10 px-2.5 py-1 text-xs font-medium text-zinc-300 dark:bg-zinc-800 dark:text-zinc-300">
          {usage.percentUsed}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full glass-card/10 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full ${usage.percentUsed >= 90 ? 'bg-rose-500' : usage.percentUsed >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.max(6, usage.percentUsed)}%` }}
        />
      </div>
    </div>
  )
}

export default StorageUsageBar
