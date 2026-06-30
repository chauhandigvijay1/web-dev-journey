import { describe, expect, it } from "vitest";
import {
  uniqueTrimmed,
  filterJobs,
  sortJobsInColumn,
  groupByStatus,
  type KanbanSort,
  type KanbanFilterState,
} from "@/lib/kanban-filters";
import type { Job, JobStatus } from "@/lib/job-types";

function job(overrides: Partial<Job> & { _id: string; title: string; company: string }): Job {
  return {
    salary: "",
    confidenceScore: 0,
    status: "saved",
    ...overrides,
  } as Job;
}

describe("uniqueTrimmed", () => {
  it("deduplicates and sorts", () => {
    expect(uniqueTrimmed(["b", "a", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("filters empty and null values", () => {
    expect(uniqueTrimmed(["a", "", "  ", null, undefined, "b"])).toEqual(["a", "b"]);
  });

  it("trims whitespace", () => {
    expect(uniqueTrimmed(["  hello  ", "world  "])).toEqual(["hello", "world"]);
  });

  it("returns empty array for empty input", () => {
    expect(uniqueTrimmed([])).toEqual([]);
  });

  it("returns empty array for only nulls", () => {
    expect(uniqueTrimmed([null, undefined])).toEqual([]);
  });
});

describe("filterJobs", () => {
  const jobs: Job[] = [
    job({ _id: "1", title: "Frontend Engineer", company: "Google", location: "Mountain View", status: "applied", jobType: "full-time", workMode: "remote", source: "linkedin" }),
    job({ _id: "2", title: "Backend Engineer", company: "Meta", location: "New York", location: "New York, USA", status: "saved", jobType: "contract", workMode: "hybrid", source: "indeed" }),
    job({ _id: "3", title: "DevOps Engineer", company: "Amazon", location: "Seattle, USA", status: "interview", jobType: "full-time", workMode: "onsite", source: "linkedin" }),
    job({ _id: "4", title: "ML Engineer", company: "OpenAI", location: "San Francisco, USA", locations: ["San Francisco, USA", "Remote"], status: "offer", jobType: "full-time", workMode: "remote", source: "wellfound" }),
  ];

  it("returns all jobs with default filters", () => {
    expect(filterJobs(jobs, defaultFilters())).toHaveLength(4);
  });

  it("filters by search query across title, company, location", () => {
    expect(filterJobs(jobs, withFilter("search", "frontend"))).toHaveLength(1);
    expect(filterJobs(jobs, withFilter("search", "google"))).toHaveLength(1);
    expect(filterJobs(jobs, withFilter("search", "usa"))).toHaveLength(3);
  });

  it("is case-insensitive for search", () => {
    expect(filterJobs(jobs, withFilter("search", "FRONTEND"))).toHaveLength(1);
  });

  it("filters by status", () => {
    expect(filterJobs(jobs, { ...defaultFilters(), status: "applied" })).toHaveLength(1);
    expect(filterJobs(jobs, { ...defaultFilters(), status: "all" })).toHaveLength(4);
  });

  it("filters by company exact match (case-insensitive)", () => {
    expect(filterJobs(jobs, withFilter("company", "google"))).toHaveLength(1);
    expect(filterJobs(jobs, withFilter("company", "Google"))).toHaveLength(1);
  });

  it("filters by jobType", () => {
    expect(filterJobs(jobs, withFilter("jobType", "contract"))).toHaveLength(1);
  });

  it("filters by workMode normalizing remote/hybrid/onsite", () => {
    expect(filterJobs(jobs, withFilter("workMode", "remote"))).toHaveLength(2);
    expect(filterJobs(jobs, withFilter("workMode", "hybrid"))).toHaveLength(1);
    expect(filterJobs(jobs, withFilter("workMode", "onsite"))).toHaveLength(1);
  });

  it("filters by source", () => {
    expect(filterJobs(jobs, withFilter("source", "linkedin"))).toHaveLength(2);
    expect(filterJobs(jobs, withFilter("source", "indeed"))).toHaveLength(1);
  });

  it("filters by place substring in location", () => {
    expect(filterJobs(jobs, withFilter("place", "new york"))).toHaveLength(1);
    expect(filterJobs(jobs, withFilter("place", "san"))).toHaveLength(1);
  });

  it("filters by country (last segment of location)", () => {
    expect(filterJobs(jobs, withFilter("country", "usa"))).toHaveLength(3);
  });

  it("combines multiple filters", () => {
    const filtered = filterJobs(jobs, {
      ...defaultFilters(),
      search: "engineer",
      status: "applied",
      workMode: "remote",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!._id).toBe("1");
  });

  it("returns empty when no match", () => {
    expect(filterJobs(jobs, withFilter("search", "xyznonexistent"))).toHaveLength(0);
  });

  it("handles empty jobs array", () => {
    expect(filterJobs([], defaultFilters())).toEqual([]);
  });
});

describe("sortJobsInColumn", () => {
  const now = Date.now();
  function makeJob(id: string, overrides: Partial<Job> & { title: string; company: string }): Job {
    return {
      _id: id,
      salary: "",
      confidenceScore: 0,
      status: "saved",
      priorityScore: 50,
      createdAt: new Date(now - 100000).toISOString(),
      ...overrides,
    } as Job;
  }

  it("sorts by latest (updatedAt falls back to createdAt)", () => {
    const jobs = [
      makeJob("1", { title: "Old", company: "A", createdAt: new Date(now - 5000).toISOString() }),
      makeJob("2", { title: "New", company: "B", createdAt: new Date(now - 1000).toISOString() }),
    ];
    const sorted = sortJobsInColumn(jobs, "latest");
    expect(sorted[0]!._id).toBe("2");
  });

  it("sorts by bestMatch (confidenceScore descending)", () => {
    const jobs = [
      makeJob("1", { title: "Low", company: "A", confidenceScore: 30 }),
      makeJob("2", { title: "High", company: "B", confidenceScore: 90 }),
    ];
    const sorted = sortJobsInColumn(jobs, "bestMatch");
    expect(sorted[0]!._id).toBe("2");
  });

  it("sorts by priority (priorityScore descending)", () => {
    const jobs = [
      makeJob("1", { title: "Low", company: "A", priorityScore: 10 }),
      makeJob("2", { title: "High", company: "B", priorityScore: 90 }),
    ];
    const sorted = sortJobsInColumn(jobs, "priority");
    expect(sorted[0]!._id).toBe("2");
  });

  it("sorts by salaryHighToLow", () => {
    const jobs = [
      makeJob("1", { title: "Low", company: "A", salary: "$50k" }),
      makeJob("2", { title: "High", company: "B", offeredSalary: "$150k" }),
    ];
    const sorted = sortJobsInColumn(jobs, "salaryHighToLow");
    expect(sorted[0]!._id).toBe("2");
  });

  it("sorts by salaryLowToHigh", () => {
    const jobs = [
      makeJob("1", { title: "Low", company: "A", salary: "$50k" }),
      makeJob("2", { title: "High", company: "B", offeredSalary: "$150k" }),
    ];
    const sorted = sortJobsInColumn(jobs, "salaryLowToHigh");
    expect(sorted[0]!._id).toBe("1");
  });

  it("sorts by followup (earliest follow-up date first)", () => {
    const jobs = [
      makeJob("1", { title: "Later", company: "A", followUpDate: new Date(now + 5000).toISOString() }),
      makeJob("2", { title: "Sooner", company: "B", followUpDate: new Date(now + 1000).toISOString() }),
    ];
    const sorted = sortJobsInColumn(jobs, "followup");
    expect(sorted[0]!._id).toBe("2");
  });

  it("places pinned items first regardless of sort", () => {
    const jobs = [
      makeJob("1", { title: "Not Pinned", company: "A", confidenceScore: 90, isPinned: false }),
      makeJob("2", { title: "Pinned", company: "B", confidenceScore: 10, isPinned: true }),
    ];
    const sorted = sortJobsInColumn(jobs, "bestMatch");
    expect(sorted[0]!._id).toBe("2");
  });

  it("handles empty array", () => {
    expect(sortJobsInColumn([], "latest")).toEqual([]);
  });

  it("handles single item", () => {
    const jobs = [makeJob("1", { title: "Only", company: "A" })];
    expect(sortJobsInColumn(jobs, "latest")).toEqual(jobs);
  });
});

describe("groupByStatus", () => {
  it("groups jobs by their status", () => {
    const jobs: Job[] = [
      job({ _id: "1", title: "A", company: "C", status: "saved" }),
      job({ _id: "2", title: "B", company: "C", status: "applied" }),
      job({ _id: "3", title: "C", company: "C", status: "saved" }),
    ];
    const groups = groupByStatus(jobs);
    expect(groups.get("saved")).toHaveLength(2);
    expect(groups.get("applied")).toHaveLength(1);
    expect(groups.get("interview")).toHaveLength(0);
  });

  it("maps unknown status to saved", () => {
    const jobs = [job({ _id: "1", title: "A", company: "C", status: "unknown_extreme" as JobStatus })];
    const groups = groupByStatus(jobs);
    expect(groups.get("saved")).toHaveLength(1);
  });

  it("returns all status keys even with empty jobs", () => {
    const groups = groupByStatus([]);
    for (const status of ["saved", "applied", "oa", "interview", "offer", "rejected"] as const) {
      expect(groups.has(status)).toBe(true);
      expect(groups.get(status)).toEqual([]);
    }
  });
});

function defaultFilters(): KanbanFilterState {
  return { search: "", status: "all", company: "", place: "", country: "", workMode: "", jobType: "", source: "" };
}

function withFilter<K extends keyof KanbanFilterState>(key: K, value: KanbanFilterState[K]): KanbanFilterState {
  return { ...defaultFilters(), [key]: value };
}
