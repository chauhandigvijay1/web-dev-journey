"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, UserCircle, ListTodo, Plus, ArrowRight } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { Job } from "@/lib/job-types";

export function DashboardHome() {
  const user = useAppSelector((s) => s.auth.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSaved, setShowSaved] = useState(false);
  const [jobsCount, setJobsCount] = useState<number | null>(null);

  useEffect(() => {
    if (searchParams.get("jobSaved") === "1") {
      setShowSaved(true);
      router.replace("/dashboard", { scroll: false });
    }
    
    api.get<{ success: boolean; data?: { jobs: Job[] } }>("/jobs")
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setJobsCount(res.data.data.jobs.length);
        }
      })
      .catch(() => undefined);
  }, [searchParams, router]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {showSaved ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-900 dark:text-emerald-100"
        >
          Job saved successfully.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Here&apos;s what&apos;s happening with your job search today.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/add-job">
              <Plus className="h-4 w-4 mr-2" /> Add Job
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col justify-between border-border/60 bg-card/50 shadow-sm transition-colors hover:bg-card/80">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Briefcase className="h-4 w-4 text-primary" />
              Active Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobsCount !== null ? jobsCount : "-"}</div>
            <p className="mt-1 text-xs text-muted-foreground">Jobs currently tracked</p>
            <Button variant="link" className="mt-4 h-auto p-0 text-primary" asChild>
              <Link href="/dashboard/jobs" className="flex items-center gap-1">
                View board <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-border/60 bg-card/50 shadow-sm transition-colors hover:bg-card/80">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <UserCircle className="h-4 w-4 text-violet-500" />
              Career Brain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage your resume, skills, and career profile.
            </p>
            <Button variant="link" className="mt-4 h-auto p-0 text-violet-500 hover:text-violet-600" asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-1">
                Manage profile <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-border/60 bg-card/50 shadow-sm transition-colors hover:bg-card/80">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <ListTodo className="h-4 w-4 text-sky-500" />
              Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Don&apos;t let applications slip through the cracks.
            </p>
            <Button variant="link" className="mt-4 h-auto p-0 text-sky-500 hover:text-sky-600" asChild>
              <Link href="/dashboard/reminders" className="flex items-center gap-1">
                Check reminders <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
