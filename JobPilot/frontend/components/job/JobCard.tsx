"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Job } from "@/lib/job-types";
import { isAutoGhosted } from "@/lib/job-ghosting";
import {
  formatFollowUpBadgeLabel,
  formatFollowUpLabel,
  getFollowUpBucket,
  hasActiveFollowUp,
} from "@/lib/reminders";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function StarRow({ score }: { score: number }) {
  const count = Math.min(5, Math.max(0, Math.ceil(Number(score) / 20)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Confidence ${score}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "h-3.5 w-3.5",
            index < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"
          )}
        />
      ))}
    </div>
  );
}

export type JobCardProps = {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
};

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const autoMarkGhostedDays = useAppSelector(
    (state) => state.auth.user?.settings?.productivity?.autoMarkGhostedDays ?? 21
  );
  const followHighlight = hasActiveFollowUp(job);
  const followUpBucket = getFollowUpBucket(job.followUpDate);
  const ghosted = isAutoGhosted(job, autoMarkGhostedDays);

  return (
    <Card
      className={cn(
        "border-border/80 shadow-sm transition-shadow hover:shadow-md",
        job.isImportant && "border-primary/45 bg-primary/[0.07] ring-1 ring-primary/25",
        followHighlight &&
          followUpBucket === "overdue" &&
          "border-l-[3px] border-l-destructive bg-destructive/[0.05]",
        followHighlight &&
          followUpBucket === "today" &&
          "border-l-[3px] border-l-amber-500/60 bg-amber-500/[0.06]",
        followHighlight &&
          followUpBucket === "upcoming" &&
          "border-l-[3px] border-l-sky-500/50 bg-sky-500/[0.05]",
        ghosted && "opacity-[0.72]"
      )}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/dashboard/jobs/${job._id}`}
            onPointerDown={(event) => event.stopPropagation()}
            className="min-w-0 flex-1 rounded-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:underline">
              {job.title}
            </h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">{job.company || "-"}</p>
          </Link>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant="outline" className="capitalize">
              {job.status}
            </Badge>
            {!job.isGhosted && ghosted ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Ghosted
              </span>
            ) : null}
          </div>
        </div>

        {job.salary ? <p className="text-xs font-medium text-foreground/90">{job.salary}</p> : null}

        {followUpBucket !== "none" ? (
          <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{formatFollowUpBadgeLabel(followUpBucket)}</span>
            {" - "}
            {formatFollowUpLabel(job.followUpDate)}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {job.companyType?.trim() ? (
            <Badge variant="secondary" className="max-w-[140px] truncate text-[10px] font-normal">
              {job.companyType}
            </Badge>
          ) : (
            <span />
          )}
          <StarRow score={job.confidenceScore ?? 0} />
        </div>

        <div className="flex gap-1 border-t border-border/60 pt-2" onPointerDown={(event) => event.stopPropagation()}>
          <Button type="button" size="sm" variant="secondary" className="h-8 flex-1 text-xs" onClick={onEdit}>
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 flex-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
