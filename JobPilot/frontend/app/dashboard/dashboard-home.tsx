"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardHome() {
  const user = useAppSelector((s) => s.auth.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (searchParams.get("jobSaved") === "1") {
      setShowSaved(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {showSaved ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100"
        >
          Job saved successfully.
        </div>
      ) : null}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job search.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>You are signed in and ready to track applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-foreground">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
