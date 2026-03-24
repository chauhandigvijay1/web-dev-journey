import type { MonthlyApplicationsPoint } from "@/lib/analytics";

type MonthlyTrendChartProps = {
  data: MonthlyApplicationsPoint[];
};

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/80 text-sm text-muted-foreground">
        Add jobs to see monthly application trends.
      </div>
    );
  }

  const max = Math.max(...data.map((point) => point.count), 1);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-end gap-3 overflow-x-auto pb-1">
        {data.map((point) => {
          const height = Math.max((point.count / max) * 180, point.count > 0 ? 24 : 12);
          return (
            <div key={point.key} className="flex min-w-[72px] flex-1 flex-col items-center gap-3">
              <div className="flex h-[200px] items-end">
                <div
                  className="flex w-12 items-end justify-center rounded-t-2xl border border-primary/20 bg-[linear-gradient(180deg,hsl(var(--primary))_0%,hsl(var(--primary)/0.55)_100%)] px-2 pb-2 text-xs font-semibold text-primary-foreground shadow-sm"
                  style={{ height }}
                  aria-label={`${point.label}: ${point.count} applications`}
                >
                  {point.count}
                </div>
              </div>
              <p className="text-center text-xs font-medium text-foreground">{point.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
