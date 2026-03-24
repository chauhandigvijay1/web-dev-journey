"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/services/api";
import type { Job } from "@/lib/job-types";
import { formatFollowUpLabel, partitionReminderJobs } from "@/lib/reminders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/store/hooks";

function ReminderRow({ job }: { job: Job }) {
  return (
    <Link
      href={`/dashboard/jobs/${job._id}`}
      className="block rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
    >
      <p className="font-medium leading-snug">{job.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{job.company || "-"}</p>
      <p className="mt-2 text-xs tabular-nums text-muted-foreground">{formatFollowUpLabel(job.followUpDate)}</p>
    </Link>
  );
}

export default function RemindersPage() {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ success: boolean; data?: { jobs: Job[] } }>("/jobs");
      if (data.success && data.data?.jobs) setJobs(data.data.jobs);
      else setJobs([]);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [pathname, load]);

  const { overdue, today, upcoming } = useMemo(() => partitionReminderJobs(jobs), [jobs]);
  const hasAny = overdue.length > 0 || today.length > 0 || upcoming.length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full max-w-lg" />
        <Skeleton className="h-32 w-full max-w-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Follow-ups by date.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {user?.emailNotifications
            ? "Email reminders are enabled for your account."
            : "Email reminders are off - you can enable them in Settings."}
        </p>
      </div>

      {!hasAny ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm font-medium">No reminders scheduled</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Set a follow-up date on a job to see it here and in the notification bell.
            </p>
            <Button className="mt-6" size="sm" asChild>
              <Link href="/dashboard/jobs">Go to jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overdue</h2>
            {overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue follow-ups.</p>
            ) : (
              <ul className="grid gap-2 sm:max-w-xl">
                {overdue.map((job) => (
                  <li key={job._id}>
                    <ReminderRow job={job} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Today</h2>
            {today.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing due today.</p>
            ) : (
              <ul className="grid gap-2 sm:max-w-xl">
                {today.map((job) => (
                  <li key={job._id}>
                    <ReminderRow job={job} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No future follow-ups.</p>
            ) : (
              <ul className="grid gap-2 sm:max-w-xl">
                {upcoming.map((job) => (
                  <li key={job._id}>
                    <ReminderRow job={job} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
