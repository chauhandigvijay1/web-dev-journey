"use client";

import { useEffect, useState } from "react";
import { BellRing, Clock3, FolderHeart } from "lucide-react";
import type { AutoHunterHistory, AutoHunterMatch } from "@/lib/auto-hunter-types";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { AutoHunterMatchCard } from "@/components/auto-hunter/match-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AutoHunterHistoryPage() {
  const [history, setHistory] = useState<AutoHunterHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: AutoHunterHistory; message?: string }>(
        "/auto-hunter/history"
      );
      if (!data.success || !data.data) {
        setError(data.message ?? "Could not load history");
        setHistory(null);
        return;
      }
      setHistory(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load history"));
      setHistory(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  async function handleSaveToggle(match: AutoHunterMatch) {
    setBusyAction(`${match.id}:save`);
    try {
      if (match.status === "saved") {
        await api.delete(`/auto-hunter/matches/${match.id}/save`);
      } else {
        await api.post(`/auto-hunter/matches/${match.id}/save`);
      }
      await loadHistory();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update saved state"));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDismiss(match: AutoHunterMatch) {
    setBusyAction(`${match.id}:dismiss`);
    try {
      await api.post(`/auto-hunter/matches/${match.id}/dismiss`);
      await loadHistory();
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
      await loadHistory();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not add match to tracker"));
    } finally {
      setBusyAction(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-80 rounded-[28px]" />
        <Skeleton className="h-80 rounded-[28px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent matched jobs</CardTitle>
          <CardDescription>Recent discoveries, score refreshes, saves, and tracker pushes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {history?.matches.length ? (
            history.matches.map((match) => (
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
            <p className="text-sm text-muted-foreground">No match history yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Alert log</CardTitle>
            <CardDescription>Delivery outcomes for automated match notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history?.alerts.length ? (
              history.alerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                        <BellRing className="h-4 w-4 text-primary" />
                        {alert.type} alert
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.reason || "No reason provided"}</p>
                    </div>
                    <Badge variant={alert.status === "sent" ? "secondary" : "outline"}>{alert.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Score {alert.score}%</span>
                    <span>Created {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "—"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No alert log entries yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Saved list snapshot</CardTitle>
            <CardDescription>Jobs you marked for follow-up but have not moved into the main tracker yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history?.savedJobs.length ? (
              history.savedJobs.map((job) => (
                <a
                  key={job.id}
                  href={job.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-border/70 bg-background/70 px-4 py-3 transition-colors hover:bg-accent/50"
                >
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <FolderHeart className="h-4 w-4 text-primary" />
                    {job.title}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{job.company} • {job.source}</p>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Saved {job.savedAt ? new Date(job.savedAt).toLocaleString() : "—"}
                  </div>
                </a>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No saved jobs in history yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
