import { describe, expect, it } from "vitest";
import { computeJobAnalytics } from "@/lib/analytics";
import type { Job } from "@/lib/job-types";

describe("computeJobAnalytics", () => {
  it("aggregates status counts, success rate, and monthly buckets", () => {
    const jobs: Job[] = [
      {
        _id: "1",
        title: "Backend Engineer",
        company: "Acme",
        salary: "",
        confidenceScore: 80,
        status: "applied",
        createdAt: "2026-01-03T10:00:00.000Z",
      },
      {
        _id: "2",
        title: "Frontend Engineer",
        company: "Acme",
        salary: "",
        confidenceScore: 60,
        status: "offer",
        createdAt: "2026-01-18T10:00:00.000Z",
      },
      {
        _id: "3",
        title: "Product Engineer",
        company: "Acme",
        salary: "",
        confidenceScore: 70,
        status: "interview",
        createdAt: "2026-02-04T10:00:00.000Z",
      },
    ];

    const analytics = computeJobAnalytics(jobs);
    expect(analytics.totalJobs).toBe(3);
    expect(analytics.statusCounts.offer).toBe(1);
    expect(analytics.statusCounts.interview).toBe(1);
    expect(analytics.successRate).toBe(33.3);
    expect(analytics.monthlyApplications).toEqual([
      { key: "2026-01", label: "Jan 2026", count: 2 },
      { key: "2026-02", label: "Feb 2026", count: 1 },
    ]);
  });
});
