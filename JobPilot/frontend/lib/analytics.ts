import { JOB_STATUSES, type Job, type JobStatus } from "@/lib/job-types";

export type JobStatusCounts = Record<JobStatus, number>;

export type MonthlyApplicationsPoint = {
  key: string;
  label: string;
  count: number;
};

export type JobAnalytics = {
  totalJobs: number;
  successRate: number;
  statusCounts: JobStatusCounts;
  monthlyApplications: MonthlyApplicationsPoint[];
};

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function parseCreatedAt(job: Job): Date | null {
  if (!job.createdAt) return null;
  const date = new Date(job.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function computeJobAnalytics(jobs: Job[]): JobAnalytics {
  const statusCounts = JOB_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as JobStatusCounts
  );

  for (const job of jobs) {
    const status = JOB_STATUSES.includes(job.status) ? job.status : "applied";
    statusCounts[status] += 1;
  }

  const totalJobs = jobs.length;
  const successRate = totalJobs === 0 ? 0 : Math.round((statusCounts.offer / totalJobs) * 1000) / 10;

  const createdDates = jobs
    .map(parseCreatedAt)
    .filter((date): date is Date => date != null)
    .sort((a, b) => a.getTime() - b.getTime());

  const monthlyApplications: MonthlyApplicationsPoint[] = [];

  if (createdDates.length > 0) {
    const start = getMonthStart(createdDates[0]);
    const end = getMonthStart(createdDates[createdDates.length - 1]);
    const counts = new Map<string, number>();

    for (const date of createdDates) {
      const key = getMonthKey(date);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = addMonths(cursor, 1)) {
      const key = getMonthKey(cursor);
      monthlyApplications.push({
        key,
        label: getMonthLabel(cursor),
        count: counts.get(key) ?? 0,
      });
    }
  }

  return {
    totalJobs,
    successRate,
    statusCounts,
    monthlyApplications,
  };
}
