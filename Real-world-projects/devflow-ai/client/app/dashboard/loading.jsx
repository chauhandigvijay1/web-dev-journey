export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
