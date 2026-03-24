"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import type { Job } from "@/lib/job-types";
import { formatFollowUpLabel, partitionReminderJobs } from "@/lib/reminders";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ReminderBell() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const [jobs, setJobs] = useState<Job[]>([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<{ success: boolean; data?: { jobs: Job[] } }>("/jobs");
      if (data.success && data.data?.jobs) {
        setJobs(data.data.jobs);
      }
    } catch {
      setJobs([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [pathname, load]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [load]);

  const { overdue, today, upcoming } = useMemo(() => partitionReminderJobs(jobs), [jobs]);
  const count = overdue.length + today.length + upcoming.length;
  const rows = useMemo(
    () => [
      ...overdue.map((job) => ({ job, section: "overdue" as const })),
      ...today.map((job) => ({ job, section: "today" as const })),
      ...upcoming.map((job) => ({ job, section: "upcoming" as const })),
    ],
    [overdue, today, upcoming]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0" aria-label="Reminders">
          <Bell className="h-4 w-4" />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),320px)] p-0">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-normal text-muted-foreground">
          Follow-up reminders
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        {rows.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">No scheduled follow-ups</div>
        ) : (
          <div className="max-h-[min(60vh,320px)] overflow-y-auto py-1">
            {rows.map(({ job, section }) => (
              <DropdownMenuItem key={job._id} asChild className="cursor-pointer p-0 focus:bg-transparent">
                <Link
                  href={`/dashboard/jobs/${job._id}`}
                  className={cn(
                    "flex flex-col gap-0.5 px-3 py-2.5 text-left outline-none hover:bg-accent focus-visible:bg-accent"
                  )}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {section === "overdue" ? "Overdue" : section === "today" ? "Today" : "Upcoming"}
                  </span>
                  <span className="line-clamp-2 text-sm font-medium leading-snug">{job.title}</span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">{job.company || "-"}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatFollowUpLabel(job.followUpDate)}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator className="my-0" />
        <div className="space-y-1 px-3 py-2">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {user?.emailNotifications
              ? "Email reminders enabled in your account."
              : "Email reminders off - enable in Settings."}
          </p>
          <Link
            href="/dashboard/reminders"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            View all reminders
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
