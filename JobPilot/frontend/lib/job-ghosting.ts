import type { Job } from "@/lib/job-types";

export function isAutoGhosted(job: Job, autoMarkGhostedDays: number): boolean {
  if (!autoMarkGhostedDays || autoMarkGhostedDays <= 0) return false;
  if (job.isGhosted) return true;
  if (job.status === "offer" || job.status === "rejected") return false;

  const reference = job.updatedAt || job.createdAt;
  if (!reference) return false;

  const referenceDate = new Date(reference);
  if (Number.isNaN(referenceDate.getTime())) return false;

  const now = Date.now();
  const daysSinceActivity = (now - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceActivity >= autoMarkGhostedDays;
}
