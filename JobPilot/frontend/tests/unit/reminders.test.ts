import { describe, expect, it, vi, afterEach } from "vitest";
import {
  getFollowUpBucket,
  hasActiveFollowUp,
  partitionReminderJobs,
  formatFollowUpLabel,
  formatFollowUpBadgeLabel,
} from "@/lib/reminders";
import type { Job } from "@/lib/job-types";

afterEach(() => {
  vi.useRealTimers();
});

describe("getFollowUpBucket", () => {
  it("returns 'none' for null or undefined", () => {
    expect(getFollowUpBucket(null)).toBe("none");
    expect(getFollowUpBucket(undefined)).toBe("none");
  });

  it("returns 'none' for empty string", () => {
    expect(getFollowUpBucket("")).toBe("none");
  });

  it("returns 'overdue' for a past date", () => {
    expect(getFollowUpBucket("2020-01-01")).toBe("overdue");
  });

  it("returns 'today' for current day", () => {
    const today = new Date();
    const yyyyMmDd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(getFollowUpBucket(yyyyMmDd)).toBe("today");
  });

  it("returns 'upcoming' for a future date", () => {
    expect(getFollowUpBucket("2099-12-25")).toBe("upcoming");
  });
});

describe("hasActiveFollowUp", () => {
  function followUpJob(followUpDate?: string | null): Job {
    return { _id: "1", title: "T", company: "C", salary: "", confidenceScore: 0, status: "saved", followUpDate } as Job;
  }

  it("returns false when no follow-up", () => {
    expect(hasActiveFollowUp(followUpJob())).toBe(false);
    expect(hasActiveFollowUp(followUpJob(null))).toBe(false);
  });

  it("returns true when follow-up is set", () => {
    expect(hasActiveFollowUp(followUpJob("2099-12-25"))).toBe(true);
  });
});

describe("partitionReminderJobs", () => {
  function reminderJob(id: string, followUpDate: string): Job {
    return { _id: id, title: id, company: "C", salary: "", confidenceScore: 0, status: "saved", followUpDate } as Job;
  }

  it("partitions jobs into overdue, today, upcoming buckets", () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const jobs = [
      reminderJob("overdue1", "2020-01-01"),
      reminderJob("overdue2", "2020-06-15"),
      reminderJob("today1", todayStr),
      reminderJob("upcoming1", "2099-12-25"),
      reminderJob("upcoming2", "2099-12-26"),
    ];
    const result = partitionReminderJobs(jobs);
    expect(result.overdue).toHaveLength(2);
    expect(result.today).toHaveLength(1);
    expect(result.upcoming).toHaveLength(2);
  });

  it("sorts overdue by follow-up date ascending", () => {
    const jobs = [
      reminderJob("later-overdue", "2020-06-01"),
      reminderJob("earlier-overdue", "2020-01-01"),
    ];
    const result = partitionReminderJobs(jobs);
    expect(result.overdue[0]!._id).toBe("earlier-overdue");
  });

  it("returns empty arrays when no jobs have follow-ups", () => {
    const jobs: Job[] = [
      { _id: "1", title: "A", company: "C", salary: "", confidenceScore: 0, status: "saved" } as Job,
    ];
    const result = partitionReminderJobs(jobs);
    expect(result.overdue).toEqual([]);
    expect(result.today).toEqual([]);
    expect(result.upcoming).toEqual([]);
  });
});

describe("formatFollowUpLabel", () => {
  it("returns '-' for null", () => {
    expect(formatFollowUpLabel(null)).toBe("-");
  });

  it("returns a formatted date for valid ISO", () => {
    const label = formatFollowUpLabel("2026-06-15");
    expect(label).not.toBe("-");
    expect(label).toContain("2026");
  });
});

describe("formatFollowUpBadgeLabel", () => {
  it("returns correct label for each bucket", () => {
    expect(formatFollowUpBadgeLabel("overdue")).toBe("Overdue");
    expect(formatFollowUpBadgeLabel("today")).toBe("Today");
    expect(formatFollowUpBadgeLabel("upcoming")).toBe("Upcoming");
    expect(formatFollowUpBadgeLabel("none")).toBe("No reminder");
  });
});
