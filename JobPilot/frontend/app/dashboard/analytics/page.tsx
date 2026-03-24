"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Clock3, RefreshCw, TrendingUp } from "lucide-react";
import type { JobStatus } from "@/lib/job-types";
import type { Job } from "@/lib/job-types";
import { computeJobAnalytics } from "@/lib/analytics";
import { api } from "@/services/api";
import { MonthlyTrendChart } from "@/components/analytics/monthly-trend-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const statusMeta: Array<{ status: JobStatus; label: string }> = [
  { status: "applied", label: "Applied" },
  { status: "interview", label: "Interview" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof BriefcaseBusiness;
}) {
  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-3xl tracking-tight">{value}</CardTitle>
        </div>
        <div className="rounded-2xl bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ success: boolean; data?: { jobs: Job[] }; message?: string }>("/jobs");
        if (cancelled) return;
        if (!data.success || !data.data?.jobs) {
          setJobs([]);
          setError(data.message ?? "Could not load analytics");
          return;
        }
        setJobs(data.data.jobs);
      } catch {
        if (cancelled) return;
        setJobs([]);
        setError("Could not load analytics");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const analytics = useMemo(() => computeJobAnalytics(jobs), [jobs]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your pipeline health, outcomes, and application pace.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total jobs"
          value={String(analytics.totalJobs)}
          description="All tracked applications in your board."
          icon={BriefcaseBusiness}
        />
        <MetricCard
          title="Offers"
          value={String(analytics.statusCounts.offer)}
          description="Opportunities that reached the offer stage."
          icon={CheckCircle2}
        />
        <MetricCard
          title="Success rate"
          value={`${analytics.successRate.toFixed(1)}%`}
          description="Offers divided by total tracked applications."
          icon={TrendingUp}
        />
        <MetricCard
          title="Active pipeline"
          value={String(analytics.statusCounts.applied + analytics.statusCounts.interview)}
          description="Applications still moving through your funnel."
          icon={Clock3}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>Where your applications currently stand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusMeta.map(({ status, label }) => (
              <div key={status} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">Current count</p>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    {analytics.statusCounts[status]}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Monthly applications</CardTitle>
              <CardDescription>Jobs grouped by created month.</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart data={analytics.monthlyApplications} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
