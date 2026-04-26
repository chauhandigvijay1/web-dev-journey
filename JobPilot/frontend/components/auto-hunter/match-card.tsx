"use client";

import Link from "next/link";
import { ExternalLink, FolderOpenDot, Sparkles } from "lucide-react";
import type { AutoHunterMatch } from "@/lib/auto-hunter-types";
import { formatHunterLabel } from "@/lib/auto-hunter-types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function scoreTone(score: number) {
  if (score >= 85) return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (score >= 70) return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  return "bg-amber-500/10 text-amber-800 dark:text-amber-300";
}

type MatchCardProps = {
  match: AutoHunterMatch;
  busyAction?: string | null;
  onSaveToggle?: (match: AutoHunterMatch) => void;
  onDismiss?: (match: AutoHunterMatch) => void;
  onTrack?: (match: AutoHunterMatch) => void;
};

export function AutoHunterMatchCard({
  match,
  busyAction,
  onSaveToggle,
  onDismiss,
  onTrack,
}: MatchCardProps) {
  const isSaved = match.status === "saved";
  const isTracked = match.status === "tracked";
  const applyUrl = match.applyUrl || match.originalUrl;

  function handleApply() {
    if (!applyUrl) return;
    if (!isTracked && onTrack) {
      onTrack(match);
    }
    window.open(applyUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", scoreTone(match.match.score))}>
                Match {match.match.score}%
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px] capitalize">
                {match.match.qualityLabel}
              </Badge>
              {match.match.urgencyLabel ? (
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                  {match.match.urgencyLabel}
                </Badge>
              ) : null}
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{match.title}</h3>
              <p className="text-sm text-muted-foreground">
                {match.company} • {match.location || formatHunterLabel(match.workMode) || "Location pending"} • {match.source}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-2" onClick={handleApply} disabled={!applyUrl}>
              <ExternalLink className="h-4 w-4" />
              {isTracked ? "Apply" : "Apply + track"}
            </Button>
            {onSaveToggle ? (
              <Button
                size="sm"
                variant={isSaved ? "secondary" : "outline"}
                disabled={busyAction === `${match.id}:save`}
                onClick={() => onSaveToggle(match)}
              >
                {busyAction === `${match.id}:save` ? "Saving..." : isSaved ? "Saved" : "Save"}
              </Button>
            ) : null}
            {isTracked ? (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/jobs/${match.trackedJob}`}>
                  <FolderOpenDot className="h-4 w-4" />
                  Open tracker
                </Link>
              </Button>
            ) : onTrack ? (
              <Button
                size="sm"
                variant="outline"
                disabled={busyAction === `${match.id}:track`}
                onClick={() => onTrack(match)}
              >
                {busyAction === `${match.id}:track` ? "Adding..." : "Track without opening"}
              </Button>
            ) : null}
            {onDismiss ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                disabled={busyAction === `${match.id}:dismiss`}
                onClick={() => onDismiss(match)}
              >
                {busyAction === `${match.id}:dismiss` ? "Hiding..." : "Dismiss"}
              </Button>
            ) : null}
          </div>
        </div>

        {match.descriptionSummary ? (
          <p className="text-sm leading-6 text-muted-foreground">{match.descriptionSummary}</p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Skill fit</p>
            <p className="mt-2 text-xl font-semibold">{match.match.componentScores.skills ?? 0}</p>
            <p className="text-xs text-muted-foreground">Resume skills vs role requirements.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Role fit</p>
            <p className="mt-2 text-xl font-semibold">{match.match.componentScores.role ?? 0}</p>
            <p className="text-xs text-muted-foreground">Target roles aligned with listing title.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ATS similarity</p>
            <p className="mt-2 text-xl font-semibold">{match.match.atsKeywordSimilarity}</p>
            <p className="text-xs text-muted-foreground">Keyword coverage across the posting.</p>
          </div>
        </div>

        {match.match.reasons.length ? (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Why it matched
            </div>
            <div className="flex flex-wrap gap-2">
              {match.match.reasons.map((reason) => (
                <Badge key={reason} variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {match.match.missingSkills.length ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Missing skills</p>
            <div className="flex flex-wrap gap-2">
              {match.match.missingSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
