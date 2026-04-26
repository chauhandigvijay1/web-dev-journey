"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, FolderHeart, Radar, UploadCloud } from "lucide-react";
import type { AutoHunterMatch, AutoHunterOverview } from "@/lib/auto-hunter-types";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { AutoHunterMatchCard } from "@/components/auto-hunter/match-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Radar;
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

export default function AutoHunterOverviewPage() {
  const [overview, setOverview] = useState<AutoHunterOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function loadOverview() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: AutoHunterOverview; message?: string }>(
        "/auto-hunter/overview"
      );
      if (!data.success || !data.data) {
        setError(data.message ?? "Could not load auto hunter dashboard");
        setOverview(null);
        return;
      }
      setOverview(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load auto hunter dashboard"));
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  async function handleSaveToggle(match: AutoHunterMatch) {
    setBusyAction(`${match.id}:save`);
    try {
      if (match.status === "saved") {
        await api.delete(`/auto-hunter/matches/${match.id}/save`);
      } else {
        await api.post(`/auto-hunter/matches/${match.id}/save`);
      }
      await loadOverview();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update saved job"));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDismiss(match: AutoHunterMatch) {
    setBusyAction(`${match.id}:dismiss`);
    try {
      await api.post(`/auto-hunter/matches/${match.id}/dismiss`);
      await loadOverview();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not dismiss match"));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleTrack(match: AutoHunterMatch) {
    setBusyAction(`${match.id}:track`);
    try {
      await api.post(`/auto-hunter/matches/${match.id}/track`);
      await loadOverview();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not add match to tracker"));
    } finally {
      setBusyAction(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-52 rounded-[28px]" />
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <Card className="border-destructive/30 bg-destructive/10">
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={() => void loadOverview()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!overview?.profile) {
    return (
      <Card className="border-dashed border-border/70 bg-card/80">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="rounded-3xl bg-primary/10 p-4 text-primary">
            <UploadCloud className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Upload a resume to activate auto hunting</h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              JobPilot already tracks your applications. This module adds resume parsing, fresh job discovery, match scoring, and instant alerts without changing your existing board.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/auto-hunter/resume">
              Upload resume
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="New matches"
          value={String(overview.stats.newMatches)}
          description="Fresh discoveries still waiting for action."
          icon={Radar}
        />
        <StatCard
          title="Saved jobs"
          value={String(overview.stats.savedJobs)}
          description="High-interest roles you explicitly kept."
          icon={FolderHeart}
        />
        <StatCard
          title="Tracked in board"
          value={String(overview.stats.appliedSuggestions)}
          description="Matches already pushed into your main tracker."
          icon={Bot}
        />
        <StatCard
          title="Alerted"
          value={String(overview.stats.emailedMatches)}
          description="Strong matches already emailed to you."
          icon={UploadCloud}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Resume intelligence</CardTitle>
            <CardDescription>
              Parsed on {overview.profile.lastParsedAt ? new Date(overview.profile.lastParsedAt).toLocaleString() : "—"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {overview.profile.parsedData.summary || "No summary was parsed from the current resume."}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Target roles</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {overview.preferences.preferredRoles.length ? (
                    overview.preferences.preferredRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No manual roles selected yet.</span>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Top skill gaps</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {overview.skillGaps.length ? (
                    overview.skillGaps.slice(0, 6).map((gap) => (
                      <Badge key={gap.skill} variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                        {gap.skill} • {gap.count}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No repeated skill gaps yet.</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Top companies hiring now</CardTitle>
              <CardDescription>Based on your most recent high-fit matches.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.topCompanies.length ? (
                overview.topCompanies.map((company) => (
                  <div key={company.company} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <span className="text-sm font-medium">{company.company}</span>
                    <Badge variant="secondary">{company.count} matches</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Company trends will appear after the first discovery sweep.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Saved jobs</CardTitle>
              <CardDescription>Quick access to roles you flagged manually.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.savedJobs.length ? (
                overview.savedJobs.map((job) => (
                  <a
                    key={job.id}
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-border/70 bg-background/70 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <p className="text-sm font-medium text-foreground">{job.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{job.company} • {job.source}</p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No saved matches yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Best current matches</CardTitle>
            <CardDescription>Only the strongest opportunities are surfaced and alerted.</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/auto-hunter/history">Open full history</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {overview.matches.length ? (
            overview.matches.map((match) => (
              <AutoHunterMatchCard
                key={match.id}
                match={match}
                busyAction={busyAction}
                onSaveToggle={handleSaveToggle}
                onDismiss={handleDismiss}
                onTrack={handleTrack}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-14 text-center">
              <p className="text-sm font-medium text-foreground">No strong matches yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Review your preferences and run a manual scan from the Alerts page after your resume finishes parsing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
