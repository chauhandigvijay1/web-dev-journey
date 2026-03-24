import type { Job } from "@/lib/job-types";
import { parseFollowUpDate } from "@/lib/follow-up-date";

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export type FollowUpBucket = "none" | "overdue" | "today" | "upcoming";

export function getFollowUpBucket(iso?: string | null): FollowUpBucket {
  const date = parseFollowUpDate(iso);
  if (!date) return "none";

  const today = startOfDay(new Date());
  const followUpDay = startOfDay(date);

  if (followUpDay.getTime() < today.getTime()) return "overdue";
  if (followUpDay.getTime() === today.getTime()) return "today";
  return "upcoming";
}

export function hasActiveFollowUp(job: Job): boolean {
  return getFollowUpBucket(job.followUpDate) !== "none";
}

export function partitionReminderJobs(jobs: Job[]): { overdue: Job[]; today: Job[]; upcoming: Job[] } {
  const overdue: Job[] = [];
  const today: Job[] = [];
  const upcoming: Job[] = [];

  for (const job of jobs) {
    switch (getFollowUpBucket(job.followUpDate)) {
      case "overdue":
        overdue.push(job);
        break;
      case "today":
        today.push(job);
        break;
      case "upcoming":
        upcoming.push(job);
        break;
      default:
        break;
    }
  }

  const byFollowUp = (left: Job, right: Job) =>
    parseFollowUpDate(left.followUpDate)!.getTime() - parseFollowUpDate(right.followUpDate)!.getTime();

  overdue.sort(byFollowUp);
  today.sort(byFollowUp);
  upcoming.sort(byFollowUp);

  return { overdue, today, upcoming };
}

export function formatFollowUpLabel(iso?: string | null): string {
  const date = parseFollowUpDate(iso);
  if (!date) return "-";

  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function formatFollowUpBadgeLabel(bucket: FollowUpBucket): string {
  switch (bucket) {
    case "overdue":
      return "Overdue";
    case "today":
      return "Today";
    case "upcoming":
      return "Upcoming";
    default:
      return "No reminder";
  }
}
