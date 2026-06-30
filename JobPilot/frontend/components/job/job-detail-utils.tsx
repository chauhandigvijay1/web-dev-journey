"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { type FollowUpBucket } from "@/lib/reminders";

export function formatWhen(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "-";
  }
}

export function followUpBadgeClass(bucket: FollowUpBucket) {
  switch (bucket) {
    case "overdue":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "today":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "upcoming":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    default:
      return "border-border/70 bg-background text-muted-foreground";
  }
}

export function ConfidenceStars({ score }: { score: number }) {
  const n = Math.min(5, Math.max(0, Math.ceil(Number(score) / 20)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Confidence ${score}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"
          )}
        />
      ))}
      <span className="ml-2 text-sm tabular-nums text-muted-foreground">{score}</span>
    </div>
  );
}

export function parseMoneyLoose(s: string) {
  const t = s.replace(/[^\d.-]/g, "");
  if (!t) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}
