import cron from "node-cron";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Job } from "../models/Job.js";
import { formatFollowUpDate, getFollowUpDateKey } from "../utils/followUpDate.js";

const DEFAULT_REMINDER_CRON = "*/15 * * * *";

let reminderTask = null;
let runningSweep = null;
let cachedTransporter = undefined;
let missingMailConfigLogged = false;

function getFrontendBaseUrl() {
  const raw = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

function getMailFromAddress() {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    ""
  ).trim();
}

function hasMailConfig() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_PORT?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      getMailFromAddress()
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createMailTransporter() {
  const port = Number(process.env.SMTP_PORT);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function getMailTransporter(logger) {
  if (cachedTransporter !== undefined) {
    return cachedTransporter;
  }

  if (!hasMailConfig()) {
    if (!missingMailConfigLogged) {
      logger.warn(
        "[reminders] SMTP config is missing. Reminder emails are scheduled but will not send until SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM are configured."
      );
      missingMailConfigLogged = true;
    }
    cachedTransporter = null;
    return cachedTransporter;
  }

  cachedTransporter = createMailTransporter();
  return cachedTransporter;
}

function buildReminderMessage(job, user) {
  const dashboardUrl = `${getFrontendBaseUrl()}/dashboard/jobs/${job._id}`;
  const dueLabel = formatFollowUpDate(job.followUpDate);
  const company = job.company?.trim() || "this company";
  const notes = job.notes?.trim();
  const safeTitle = escapeHtml(job.title);
  const safeCompany = escapeHtml(job.company || "");
  const safeDueLabel = escapeHtml(dueLabel);
  const safeNotes = notes ? escapeHtml(notes) : "";
  const safeStatus = job.status ? escapeHtml(job.status) : "";
  const safeUserName = escapeHtml(user.name || "there");

  return {
    from: getMailFromAddress(),
    to: user.email,
    subject: `JobPilot reminder: follow up on ${job.title}${job.company ? ` at ${job.company}` : ""}`,
    text: [
      `Hi ${user.name || "there"},`,
      "",
      `This is your JobPilot reminder to follow up on "${job.title}" at ${company}.`,
      `Follow-up date: ${dueLabel}`,
      job.status ? `Current status: ${job.status}` : "",
      notes ? `Notes: ${notes}` : "",
      "",
      `Open this job: ${dashboardUrl}`,
      "",
      "You are receiving this because email reminders are enabled on your account.",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${safeUserName},</p>
        <p>
          This is your JobPilot reminder to follow up on
          <strong>${safeTitle}</strong>${job.company ? ` at <strong>${safeCompany}</strong>` : ""}.
        </p>
        <p><strong>Follow-up date:</strong> ${safeDueLabel}</p>
        ${job.status ? `<p><strong>Current status:</strong> ${safeStatus}</p>` : ""}
        ${notes ? `<p><strong>Notes:</strong> ${safeNotes}</p>` : ""}
        <p>
          <a href="${dashboardUrl}" style="color: #2563eb; text-decoration: none;">Open this job in JobPilot</a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">
          You are receiving this because email reminders are enabled on your account.
        </p>
      </div>
    `,
  };
}

async function sendReminderEmail(job, user, logger) {
  const transporter = await getMailTransporter(logger);
  if (!transporter) {
    return false;
  }

  const info = await transporter.sendMail(buildReminderMessage(job, user));
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    logger.info(`[reminders] Preview URL for job ${job._id}: ${previewUrl}`);
  }
  return true;
}

export async function runReminderSweep({ now = new Date(), logger = console } = {}) {
  if (runningSweep) {
    return runningSweep;
  }

  runningSweep = (async () => {
    if (mongoose.connection.readyState !== 1) {
      return {
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
        reason: "database-not-ready",
      };
    }

    const jobs = await Job.find({
      followUpDate: { $ne: null, $lte: now },
    }).populate({
      path: "user",
      select: "name email emailNotifications",
      match: {
        emailNotifications: true,
        email: { $exists: true, $ne: "" },
      },
    });

    let processed = 0;
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const job of jobs) {
      processed += 1;

      const user = job.user;
      if (!user?.email) {
        skipped += 1;
        continue;
      }

      const reminderKey = getFollowUpDateKey(job.followUpDate);
      if (!reminderKey || job.reminderLastSentForDate === reminderKey) {
        skipped += 1;
        continue;
      }

      try {
        const delivered = await sendReminderEmail(job, user, logger);
        if (!delivered) {
          skipped += 1;
          continue;
        }

        job.reminderLastSentAt = now;
        job.reminderLastSentForDate = reminderKey;
        await job.save();
        sent += 1;
      } catch (error) {
        failed += 1;
        logger.error(
          `[reminders] Failed to send reminder for job ${job._id}: ${error.message}`
        );
      }
    }

    logger.info(
      `[reminders] Sweep complete: processed=${processed} sent=${sent} skipped=${skipped} failed=${failed}`
    );

    return { processed, sent, skipped, failed };
  })().finally(() => {
    runningSweep = null;
  });

  return runningSweep;
}

export function startReminderScheduler(logger = console) {
  if (reminderTask) {
    return reminderTask;
  }

  const expression = process.env.REMINDER_CRON?.trim() || DEFAULT_REMINDER_CRON;
  reminderTask = cron.schedule(expression, () => {
    void runReminderSweep({ logger });
  });

  logger.info(`[reminders] Scheduler started with "${expression}"`);
  void runReminderSweep({ logger });

  return reminderTask;
}
