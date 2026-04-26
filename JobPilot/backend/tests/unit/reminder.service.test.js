import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { Job } from "../../src/models/Job.js";
import { ReminderQueue } from "../../src/models/ReminderQueue.js";
import { User } from "../../src/models/User.js";
import { getMailOutbox } from "../../src/services/mail.service.js";
import { runReminderSweep, syncJobReminders } from "../../src/services/reminder.service.js";
import { startTestDatabase, resetTestDatabase, stopTestDatabase } from "../helpers/database.js";

describe("reminder service", () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it("creates queue entries and sends due follow-up emails", async () => {
    const user = await User.create({
      name: "Asha",
      username: "asha",
      email: "asha@example.com",
      password: "Secure@123",
      emailNotifications: true,
      settings: {
        notifications: {
          timezone: "UTC",
          reminderHour: 9,
          weeklySummaryEnabled: false,
        },
      },
    });

    const job = await Job.create({
      user: user._id,
      title: "Backend Engineer",
      company: "Acme",
      followUpDate: new Date("2026-04-23T12:00:00.000Z"),
      status: "applied",
    });

    await syncJobReminders(job, user);

    const queued = await ReminderQueue.find({ job: job._id });
    expect(queued).toHaveLength(1);
    expect(queued[0].type).toBe("follow_up");

    const result = await runReminderSweep({
      now: new Date("2026-04-23T09:05:00.000Z"),
    });

    expect(result.sent).toBe(1);
    expect(getMailOutbox()).toHaveLength(1);

    const sentReminder = await ReminderQueue.findById(queued[0]._id).lean();
    expect(sentReminder?.status).toBe("sent");
  });
});
