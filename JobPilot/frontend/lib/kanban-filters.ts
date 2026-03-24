import { JOB_STATUSES, isJobStatus, type Job, type JobStatus } from "@/lib/job-types";

export type KanbanSort = "latest" | "confidence" | "followup";

export type KanbanFilterState = {
  status: JobStatus | "all";
  jobType: string;
  source: string;
};

export const defaultKanbanFilters: KanbanFilterState = {
  status: "all",
  jobType: "",
  source: "",
};

export function uniqueTrimmed(values: (string | undefined | null)[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const t = (v ?? "").trim();
    if (t) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function filterJobs(jobs: Job[], f: KanbanFilterState): Job[] {
  return jobs.filter((j) => {
    if (f.status !== "all" && j.status !== f.status) return false;
    if (f.jobType && (j.jobType ?? "").trim() !== f.jobType) return false;
    if (f.source && (j.source ?? "").trim() !== f.source) return false;
    return true;
  });
}

function followUpTime(iso?: string | null): number | null {
  if (iso == null || iso === "") return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

function latestTime(j: Job): number {
  const c = j.createdAt ? new Date(j.createdAt).getTime() : NaN;
  const u = j.updatedAt ? new Date(j.updatedAt).getTime() : NaN;
  const vals = [c, u].filter((x) => !Number.isNaN(x));
  return vals.length ? Math.max(...vals) : 0;
}

export function sortJobsInColumn(jobs: Job[], sort: KanbanSort): Job[] {
  const copy = [...jobs];
  copy.sort((a, b) => {
    const ap = !!a.isPinned;
    const bp = !!b.isPinned;
    if (ap !== bp) return ap ? -1 : 1;

    switch (sort) {
      case "latest":
        return latestTime(b) - latestTime(a);
      case "confidence":
        return (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0);
      case "followup": {
        const fa = followUpTime(a.followUpDate);
        const fb = followUpTime(b.followUpDate);
        if (fa === null && fb === null) return latestTime(b) - latestTime(a);
        if (fa === null) return 1;
        if (fb === null) return -1;
        return fa - fb;
      }
      default:
        return 0;
    }
  });
  return copy;
}

export function groupByStatus(jobs: Job[]): Map<JobStatus, Job[]> {
  const m = new Map<JobStatus, Job[]>();
  for (const s of JOB_STATUSES) m.set(s, []);
  for (const j of jobs) {
    const st = isJobStatus(j.status) ? j.status : "applied";
    m.get(st)!.push(j);
  }
  return m;
}
