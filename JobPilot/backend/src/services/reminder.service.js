import cron from "node-cron";
import mongoose from "mongoose";
import { DateTime } from "luxon";
import { env } from "../config/env.js";
import { Job } from "../models/Job.js";
import { ReminderQueue } from "../models/ReminderQueue.js";
import { User } from "../models/User.js";
import {
  buildDeadlineReminderEmail,
  buildFollowUpReminderEmail,
  buildInterviewReminderEmail,
  buildWeeklySummaryEmail,
} from "./email-templates.service.js";
import { sendMail } from "./mail.service.js";
import { logger as defaultLogger } from "../utils/logger.js";
import {
  formatFollowUpDate,
  getFollowUpDateKey,
  parseFollowUpDate,
} from "../utils/followUpDate.js";
import { normalizeSettings } from "./auth.service.js";

let reminderTask = null;
let runningSweep = null;

/* ======================================================
   HELPERS
====================================================== */

function userNotificationSettings(user) {
  const settings = normalizeSettings(user?.settings);
  return settings.notifications;
}

function staleLockThreshold(now) {
  return new Date(now.getTime() - env.reminderLockMinutes * 60 * 1000);
}

function reminderMessageId(reminder) {
  return `<jobpilot-${reminder.type}-${reminder._id}@jobpilot.local>`;
}

function getFollowUpReason(job) {
  if (job.status === "interview") {
    return "Your interview process needs a timely follow-up.";
  }

  return "This follow-up date is due based on your application timeline.";
}

function getSuggestedNextAction(job, type) {
  if (type === "deadline") {
    return "Submit application before deadline.";
  }

  if (job.status === "interview") {
    return "Send a professional interview follow-up.";
  }

  return "Send a short status follow-up email.";
}

/* ======================================================
   DATE FIXED
====================================================== */

function toScheduledDate(dateValue, timezone, reminderHour) {
  const date = parseFollowUpDate(dateValue);
  if (!date) return null;

  const utc = DateTime.fromJSDate(date, { zone: "utc" });

  const scheduled = utc
    .setZone(timezone)
    .set({
      hour: reminderHour,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toUTC()
    .toJSDate();

  return scheduled;
}

/* ======================================================
   DB OPS
====================================================== */

async function upsertReminder(spec) {
  return ReminderQueue.findOneAndUpdate(
    { dedupeKey: spec.dedupeKey },
    {
      $set: {
        user: spec.user,
        job: spec.job ?? null,
        type: spec.type,
        timezone: spec.timezone,
        scheduledFor: spec.scheduledFor,
        nextAttemptAt: spec.scheduledFor,
        payload: spec.payload ?? {},
        status: "pending",
        attempts: 0,
        lockedAt: null,
        sentAt: null,
        lastError: "",
      },
      $setOnInsert: {
        maxAttempts: spec.maxAttempts ?? env.reminderRetryLimit,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}

async function cancelOtherJobReminders(jobId, keepKeys = []) {
  const query = {
    job: jobId,
    status: { $in: ["pending", "retry", "processing"] },
  };

  if (keepKeys.length) {
    query.dedupeKey = { $nin: keepKeys };
  }

  await ReminderQueue.updateMany(query, {
    $set: {
      status: "cancelled",
      lockedAt: null,
    },
  });
}

export async function cancelJobReminders(jobId) {
  await ReminderQueue.updateMany(
    {
      job: jobId,
      status: { $in: ["pending", "retry", "processing"] },
    },
    {
      $set: {
        status: "cancelled",
        lockedAt: null,
      },
    }
  );
}

export async function cancelAllJobReminders(jobIds = []) {
  if (!jobIds.length) return;

  await ReminderQueue.updateMany(
    {
      job: { $in: jobIds },
      status: { $in: ["pending", "retry", "processing"] },
    },
    {
      $set: {
        status: "cancelled",
        lockedAt: null,
      },
    }
  );
}

/* ======================================================
   WEEKLY SUMMARY
====================================================== */

async function scheduleWeeklySummaryForUser(user, now = new Date()) {
  if (!user.emailNotifications) return null;

  const notifications = userNotificationSettings(user);

  if (!notifications.weeklySummaryEnabled) return null;

  const localNow = DateTime.fromJSDate(now, {
    zone: notifications.timezone,
  });

  const scheduled = localNow
    .startOf("week")
    .set({
      hour: notifications.reminderHour,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

  const weekKey = scheduled.toFormat("kkkk-'W'WW");

  return upsertReminder({
    user: user._id,
    type: "weekly_summary",
    timezone: notifications.timezone,
    scheduledFor: scheduled.toUTC().toJSDate(),
    dedupeKey: `weekly_summary:${user._id}:${weekKey}`,
    payload: {
      weekLabel: `${scheduled.startOf("week").toFormat("dd LLL")} - ${scheduled
        .endOf("week")
        .toFormat("dd LLL yyyy")}`,
    },
  });
}

async function ensureWeeklySummaryReminders(now) {
  const users = await User.find({
    emailNotifications: true,
    email: { $exists: true, $ne: "" },
    "settings.notifications.weeklySummaryEnabled": true,
  }).select("emailNotifications email settings");

  for (const user of users) {
    await scheduleWeeklySummaryForUser(user, now);
  }
}

/* ======================================================
   EMAIL BUILDERS
====================================================== */

async function buildWeeklySummaryPayload(user, reminder) {
  const start = DateTime.fromJSDate(reminder.scheduledFor, {
    zone: reminder.timezone,
  }).startOf("week");

  const end = start.endOf("week");

  const jobs = await Job.find({
    user: user._id,
    createdAt: {
      $gte: start.toUTC().toJSDate(),
      $lte: end.toUTC().toJSDate(),
    },
  }).lean();

  return buildWeeklySummaryEmail({
    userName: user.name || "there",
    weekLabel: reminder.payload?.weekLabel || "",
    metrics: {
      newJobs: jobs.length,
      interviews: jobs.filter((x) => x.status === "interview").length,
      offers: jobs.filter((x) => x.status === "offer").length,
      followUpsDue: await Job.countDocuments({
        user: user._id,
        followUpDate: {
          $gte: new Date(),
        },
      }),
    },
    highlights: jobs.slice(0, 3).map((j) => `${j.title} at ${j.company}`),
  });
}

function buildReminderEmail(reminder, user, job) {
  if (reminder.type === "weekly_summary") {
    return buildWeeklySummaryPayload(user, reminder);
  }

  const company = job.company || "Unknown company";
  const nextAction = getSuggestedNextAction(job, reminder.type);

  if (reminder.type === "deadline") {
    return Promise.resolve(
      buildDeadlineReminderEmail({
        userName: user.name,
        jobTitle: job.title,
        company,
        deadlineLabel: formatFollowUpDate(job.applyDeadline),
        nextAction,
        jobId: job._id,
      })
    );
  }

  if (reminder.type === "interview") {
    return Promise.resolve(
      buildInterviewReminderEmail({
        userName: user.name,
        jobTitle: job.title,
        company,
        reminderDate: formatFollowUpDate(job.followUpDate),
        nextAction,
        jobId: job._id,
      })
    );
  }

  return Promise.resolve(
    buildFollowUpReminderEmail({
      userName: user.name,
      jobTitle: job.title,
      company,
      appliedDate: formatFollowUpDate(job.createdAt),
      reason: getFollowUpReason(job),
      nextAction,
      jobId: job._id,
    })
  );
}

/* ======================================================
   MARKERS
====================================================== */

async function markReminderSent(reminder, now) {
  reminder.status = "sent";
  reminder.sentAt = now;
  reminder.lastAttemptAt = now;
  reminder.lockedAt = null;

  await reminder.save();

  if (reminder.job) {
    await Job.updateOne(
      { _id: reminder.job },
      {
        $set: {
          reminderLastSentAt: now,
          reminderLastSentForDate: getFollowUpDateKey(
            reminder.payload?.followUpDate ||
              reminder.payload?.applyDeadline ||
              reminder.scheduledFor
          ),
        },
      }
    );
  }
}

async function markReminderFailure(reminder, now, error) {
  reminder.attempts += 1;
  reminder.lastAttemptAt = now;
  reminder.lockedAt = null;
  reminder.lastError = String(error?.message || error);

  if (reminder.attempts >= reminder.maxAttempts) {
    reminder.status = "failed";
  } else {
    reminder.status = "retry";

    const mins =
      env.reminderRetryBaseMinutes *
      2 ** (reminder.attempts - 1);

    reminder.nextAttemptAt = new Date(
      now.getTime() + mins * 60 * 1000
    );
  }

  await reminder.save();
}

/* ======================================================
   CLAIM
====================================================== */

async function claimNextReminder(now) {
  return ReminderQueue.findOneAndUpdate(
    {
      $or: [
        {
          status: { $in: ["pending", "retry"] },
          nextAttemptAt: { $lte: now },
        },
        {
          status: "processing",
          lockedAt: { $lte: staleLockThreshold(now) },
        },
      ],
    },
    {
      $set: {
        status: "processing",
        lockedAt: now,
      },
    },
    {
      sort: { nextAttemptAt: 1 },
      new: true,
    }
  );
}

/* ======================================================
   PROCESS
====================================================== */

async function processOneReminder(reminder, now, logger) {
  const populated = await ReminderQueue.findById(reminder._id)
    .populate({
      path: "user",
      select: "name email emailNotifications settings",
    })
    .populate("job");

  if (!populated) return { skipped: 1 };

  if (!populated.user?.email || !populated.user.emailNotifications) {
    populated.status = "cancelled";
    populated.lockedAt = null;
    await populated.save();
    return { skipped: 1 };
  }

  if (populated.type !== "weekly_summary" && !populated.job) {
    populated.status = "cancelled";
    populated.lockedAt = null;
    await populated.save();
    return { skipped: 1 };
  }

  try {
    const msg = await buildReminderEmail(
      populated,
      populated.user,
      populated.job
    );

    await sendMail({
      to: populated.user.email,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      messageId: reminderMessageId(populated),
    });

    await markReminderSent(populated, now);

    return { sent: 1 };
  } catch (error) {
    logger.error("Reminder failed", error);
    await markReminderFailure(populated, now, error);
    return { failed: 1 };
  }
}

/* ======================================================
   MAIN SWEEP FIXED
====================================================== */

export async function runReminderSweep({
  now = new Date(),
  logger = defaultLogger,
} = {}) {
  if (runningSweep) return runningSweep;

  runningSweep = (async () => {
    if (mongoose.connection.readyState !== 1) {
      return {
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
      };
    }

    await ensureWeeklySummaryReminders(now);

    let processed = 0;
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    let batchProcessed;
    do {
      batchProcessed = 0;
      while (batchProcessed < env.reminderBatchSize) {
        const reminder = await claimNextReminder(now);
        if (!reminder) break;

        batchProcessed++;
        processed++;

        const result = await processOneReminder(
          reminder,
          now,
          logger
        );

        sent += result.sent || 0;
        skipped += result.skipped || 0;
        failed += result.failed || 0;
      }
    } while (batchProcessed === env.reminderBatchSize);

    logger.info("[reminders] Sweep complete", {
      processed,
      sent,
      skipped,
      failed,
    });

    return {
      processed,
      sent,
      skipped,
      failed,
    };
  })().finally(() => {
    runningSweep = null;
  });

  return runningSweep;
}

/* ======================================================
   PUBLIC
====================================================== */

export async function syncJobReminders(job, user = null) {
  if (!job?.user) return [];

  const currentUser =
    user ||
    (await User.findById(job.user).select(
      "email emailNotifications settings name"
    ));

  if (!currentUser?.email || !currentUser.emailNotifications) {
    await cancelOtherJobReminders(job._id);
    return [];
  }

  const notifications =
    userNotificationSettings(currentUser);

  const keepKeys = [];
  const created = [];

  if (job.followUpDate) {
    const type =
      job.status === "interview"
        ? "interview"
        : "follow_up";

    const key = `${type}:${job._id}:${getFollowUpDateKey(
      job.followUpDate
    )}`;

    const scheduledFor = toScheduledDate(
      job.followUpDate,
      notifications.timezone,
      notifications.reminderHour
    );

    if (scheduledFor) {
      keepKeys.push(key);

      created.push(
        await upsertReminder({
          user: currentUser._id,
          job: job._id,
          type,
          timezone: notifications.timezone,
          scheduledFor,
          dedupeKey: key,
          payload: {
            followUpDate: job.followUpDate,
          },
        })
      );
    }
  }

  if (job.applyDeadline) {
    const key = `deadline:${job._id}:${getFollowUpDateKey(
      job.applyDeadline
    )}`;

    const scheduledFor = toScheduledDate(
      job.applyDeadline,
      notifications.timezone,
      notifications.reminderHour
    );

    if (scheduledFor) {
      keepKeys.push(key);

      created.push(
        await upsertReminder({
          user: currentUser._id,
          job: job._id,
          type: "deadline",
          timezone: notifications.timezone,
          scheduledFor,
          dedupeKey: key,
          payload: {
            applyDeadline: job.applyDeadline,
          },
        })
      );
    }
  }

  await cancelOtherJobReminders(job._id, keepKeys);

  return created;
}

export async function syncRemindersForUser(userId) {
  const user = await User.findById(userId).select(
    "email emailNotifications settings"
  );

  if (!user) return;

  const jobs = await Job.find({ user: userId });

  for (const job of jobs) {
    await syncJobReminders(job, user);
  }

  await scheduleWeeklySummaryForUser(user);
}

export function startReminderScheduler(
  logger = defaultLogger
) {
  if (reminderTask) return reminderTask;

  reminderTask = cron.schedule(
    env.reminderCron,
    () => {
      void runReminderSweep({ logger });
    },
    { scheduled: true }
  );

  logger.info("Reminder scheduler started");

  void runReminderSweep({ logger });

  return reminderTask;
}
