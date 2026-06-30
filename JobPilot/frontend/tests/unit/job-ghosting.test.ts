import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { isAutoGhosted } from "@/lib/job-ghosting";
import type { Job } from "@/lib/job-types";

function ghostJob(overrides: Partial<Job> & { _id: string; title: string; company: string }): Job {
  return { _id: overrides._id, title: overrides.title, company: overrides.company, salary: "", confidenceScore: 0, status: "saved", ...overrides } as Job;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-30T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("isAutoGhosted", () => {
  it("returns false when autoMarkGhostedDays is 0 or negative", () => {
    const job = ghostJob({ _id: "1", title: "T", company: "C", createdAt: "2020-01-01" });
    expect(isAutoGhosted(job, 0)).toBe(false);
    expect(isAutoGhosted(job, -1)).toBe(false);
  });

  it("returns true when job is already ghosted", () => {
    const job = ghostJob({ _id: "1", title: "T", company: "C", isGhosted: true });
    expect(isAutoGhosted(job, 30)).toBe(true);
  });

  it("returns false for offer or rejected status regardless of age", () => {
    const oldJob = ghostJob({ _id: "1", title: "T", company: "C", status: "offer", createdAt: "2020-01-01" });
    expect(isAutoGhosted(oldJob, 30)).toBe(false);
    const rejectedJob = ghostJob({ _id: "2", title: "T", company: "C", status: "rejected", createdAt: "2020-01-01" });
    expect(isAutoGhosted(rejectedJob, 30)).toBe(false);
  });

  it("returns false when no reference date exists", () => {
    const job = ghostJob({ _id: "1", title: "T", company: "C", createdAt: undefined, updatedAt: undefined });
    expect(isAutoGhosted(job, 30)).toBe(false);
  });

  it("returns false when job is newer than threshold", () => {
    const job = ghostJob({ _id: "1", title: "T", company: "C", createdAt: "2026-06-28T12:00:00.000Z" });
    expect(isAutoGhosted(job, 30)).toBe(false);
  });

  it("returns true when job is older than threshold", () => {
    const job = ghostJob({ _id: "1", title: "T", company: "C", createdAt: "2026-05-01T12:00:00.000Z" });
    expect(isAutoGhosted(job, 30)).toBe(true);
  });

  it("uses updatedAt over createdAt when available", () => {
    const job = ghostJob({
      _id: "1", title: "T", company: "C",
      createdAt: "2026-01-01T12:00:00.000Z",
      updatedAt: "2026-06-25T12:00:00.000Z",
    });
    expect(isAutoGhosted(job, 30)).toBe(false);
  });

  it("handles invalid date strings gracefully", () => {
    const job = ghostJob({ _id: "1", title: "T", company: "C", createdAt: "not-a-date" });
    expect(isAutoGhosted(job, 30)).toBe(false);
  });

  it("returns true when exactly at the threshold boundary", () => {
    const thirtyDaysAgo = "2026-05-31T12:00:00.000Z";
    const job = ghostJob({ _id: "1", title: "T", company: "C", createdAt: thirtyDaysAgo });
    expect(isAutoGhosted(job, 30)).toBe(true);
  });
});
