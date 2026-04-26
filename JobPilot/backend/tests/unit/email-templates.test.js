import { describe, expect, it } from "vitest";
import {
  buildDeadlineReminderEmail,
  buildFollowUpReminderEmail,
  buildInterviewReminderEmail,
  buildWeeklySummaryEmail,
} from "../../src/services/email-templates.service.js";

describe("email templates", () => {
  it("builds a polished follow-up reminder email", () => {
    const message = buildFollowUpReminderEmail({
      userName: "Asha",
      jobTitle: "Backend Engineer",
      company: "Acme",
      appliedDate: "April 10, 2026",
      reason: "Follow-up date reached",
      nextAction: "Send a concise status check-in",
      jobId: "job-1",
    });

    expect(message.subject).toBe("Follow-up Reminder: Backend Engineer at Acme");
    expect(message.html).toContain("Follow-up Reminder");
    expect(message.text).toContain("Suggested next action");
    expect(message.html).toContain("https://jobpilot-client-chi.vercel.app/dashboard/jobs/job-1");
    expect(message.text).not.toContain("localhost:3000");
  });

  it("covers interview, deadline, and weekly summary variants", () => {
    const interview = buildInterviewReminderEmail({
      userName: "Asha",
      jobTitle: "Frontend Engineer",
      company: "Acme",
      reminderDate: "April 12, 2026",
      nextAction: "Review interview notes",
      jobId: "job-2",
    });
    const deadline = buildDeadlineReminderEmail({
      userName: "Asha",
      jobTitle: "Data Analyst",
      company: "Acme",
      deadlineLabel: "April 30, 2026",
      nextAction: "Submit before cutoff",
      jobId: "job-3",
    });
    const weekly = buildWeeklySummaryEmail({
      userName: "Asha",
      weekLabel: "20 Apr - 26 Apr 2026",
      metrics: { newJobs: 4, interviews: 2, offers: 1, followUpsDue: 3 },
      highlights: ["Backend Engineer at Acme (interview)"],
    });

    expect(interview.subject).toContain("Interview Reminder");
    expect(deadline.subject).toContain("Deadline Reminder");
    expect(weekly.subject).toContain("Weekly Summary");
    expect(weekly.html).toContain("Highlights");
  });
});
