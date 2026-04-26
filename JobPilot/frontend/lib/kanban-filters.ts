import { JOB_STATUSES, isJobStatus, type Job, type JobStatus } from "@/lib/job-types";

export type KanbanSort =
  | "latest"
  | "bestMatch"
  | "salaryHighToLow"
  | "salaryLowToHigh"
  | "followup";

export type KanbanFilterState = {
  search: string;
  status: JobStatus | "all";
  company: string;
  place: string;
  country: string;
  workMode: string;
  jobType: string;
  source: string;
};

export const defaultKanbanFilters: KanbanFilterState = {
  search: "",
  status: "all",
  company: "",
  place: "",
  country: "",
  workMode: "",
  jobType: "",
  source: "",
};

function normalizeText(value: string | undefined | null) {
  return (value ?? "").trim().toLowerCase();
}

function locationValues(job: Job) {
  return [job.location, ...(job.locations ?? [])]
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
}

function locationSegments(job: Job) {
  const segments = locationValues(job).flatMap((value) =>
    value
      .split(/,|\//)
      .map((part) => part.trim())
      .filter(Boolean)
  );

  return uniqueTrimmed(segments);
}

function countryTokens(job: Job) {
  const countries = locationValues(job)
    .map((value) => {
      const parts = value
        .split(/,|\//)
        .map((part) => part.trim())
        .filter(Boolean);
      return parts.length > 1 ? parts[parts.length - 1] : "";
    })
    .filter(Boolean);

  return uniqueTrimmed(countries);
}

function normalizeWorkMode(value: string | undefined | null) {
  const text = normalizeText(value);
  if (!text) return "";
  if (text.includes("remote")) return "remote";
  if (text.includes("hybrid")) return "hybrid";
  if (text.includes("onsite") || text.includes("on-site") || text.includes("office")) return "onsite";
  return text;
}

function parseSalaryToken(token: string) {
  const normalized = token.toLowerCase().replace(/,/g, "");
  const value = Number.parseFloat(normalized.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(value)) return null;

  if (normalized.includes("crore") || normalized.includes("cr")) return value * 10_000_000;
  if (normalized.includes("lakh") || normalized.includes("lac") || normalized.includes("lpa")) {
    return value * 100_000;
  }
  if (normalized.endsWith("m")) return value * 1_000_000;
  if (normalized.endsWith("k")) return value * 1_000;
  return value;
}

function salarySortValue(job: Job) {
  const source = [job.offeredSalary, job.salary, job.expectedSalary]
    .map((value) => (value ?? "").trim())
    .find(Boolean);

  if (!source) return null;

  const tokens =
    source.match(/(?:usd|inr|eur|gbp|\$|rs\.?)?\s?\d[\d,]*(?:\.\d+)?\s?(?:k|m|cr|crore|lakh|lac|lpa)?/gi) || [];
  const numbers = tokens.map(parseSalaryToken).filter((value): value is number => value != null);
  if (!numbers.length) return null;
  return Math.max(...numbers);
}

export function uniqueTrimmed(values: (string | undefined | null)[]): string[] {
  const set = new Set<string>();
  for (const value of values) {
    const trimmed = (value ?? "").trim();
    if (trimmed) set.add(trimmed);
  }
  return Array.from(set).sort((left, right) => left.localeCompare(right));
}

export function filterJobs(jobs: Job[], filters: KanbanFilterState): Job[] {
  const query = normalizeText(filters.search);
  const placeQuery = normalizeText(filters.place);
  const countryQuery = normalizeText(filters.country);
  const companyQuery = normalizeText(filters.company);
  const workModeQuery = normalizeText(filters.workMode);
  const sourceQuery = normalizeText(filters.source);

  return jobs.filter((job) => {
    if (query) {
      const haystack = [
        job.title,
        job.company,
        job.location,
        ...(job.locations ?? []),
        job.jobType,
        job.status,
        job.salary,
        job.workMode,
        job.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    if (filters.status !== "all" && job.status !== filters.status) return false;
    if (companyQuery && normalizeText(job.company) !== companyQuery) return false;
    if (filters.jobType && normalizeText(job.jobType) !== normalizeText(filters.jobType)) return false;
    if (workModeQuery && normalizeWorkMode(job.workMode) !== normalizeWorkMode(filters.workMode)) return false;
    if (sourceQuery && normalizeText(job.source) !== sourceQuery) return false;

    if (placeQuery) {
      const matchesPlace = [...locationValues(job), ...locationSegments(job)].some((value) =>
        normalizeText(value).includes(placeQuery)
      );
      if (!matchesPlace) return false;
    }

    if (countryQuery) {
      const matchesCountry = [...countryTokens(job), ...locationValues(job)].some((value) =>
        normalizeText(value).includes(countryQuery)
      );
      if (!matchesCountry) return false;
    }

    return true;
  });
}

function followUpTime(value?: string | null) {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function latestTime(job: Job) {
  const createdAt = job.createdAt ? new Date(job.createdAt).getTime() : Number.NaN;
  const updatedAt = job.updatedAt ? new Date(job.updatedAt).getTime() : Number.NaN;
  const valid = [createdAt, updatedAt].filter((value) => !Number.isNaN(value));
  return valid.length ? Math.max(...valid) : 0;
}

export function sortJobsInColumn(jobs: Job[], sort: KanbanSort): Job[] {
  const copy = [...jobs];

  copy.sort((left, right) => {
    const leftPinned = Boolean(left.isPinned);
    const rightPinned = Boolean(right.isPinned);
    if (leftPinned !== rightPinned) return leftPinned ? -1 : 1;

    switch (sort) {
      case "latest":
        return latestTime(right) - latestTime(left);
      case "bestMatch":
        return (right.confidenceScore ?? 0) - (left.confidenceScore ?? 0);
      case "salaryHighToLow": {
        const leftSalary = salarySortValue(left);
        const rightSalary = salarySortValue(right);
        if (leftSalary == null && rightSalary == null) return latestTime(right) - latestTime(left);
        if (leftSalary == null) return 1;
        if (rightSalary == null) return -1;
        return rightSalary - leftSalary;
      }
      case "salaryLowToHigh": {
        const leftSalary = salarySortValue(left);
        const rightSalary = salarySortValue(right);
        if (leftSalary == null && rightSalary == null) return latestTime(right) - latestTime(left);
        if (leftSalary == null) return 1;
        if (rightSalary == null) return -1;
        return leftSalary - rightSalary;
      }
      case "followup": {
        const leftFollowUp = followUpTime(left.followUpDate);
        const rightFollowUp = followUpTime(right.followUpDate);
        if (leftFollowUp == null && rightFollowUp == null) return latestTime(right) - latestTime(left);
        if (leftFollowUp == null) return 1;
        if (rightFollowUp == null) return -1;
        return leftFollowUp - rightFollowUp;
      }
      default:
        return 0;
    }
  });

  return copy;
}

export function groupByStatus(jobs: Job[]): Map<JobStatus, Job[]> {
  const groups = new Map<JobStatus, Job[]>();
  for (const status of JOB_STATUSES) groups.set(status, []);
  for (const job of jobs) {
    const status = isJobStatus(job.status) ? job.status : "applied";
    groups.get(status)?.push(job);
  }
  return groups;
}
