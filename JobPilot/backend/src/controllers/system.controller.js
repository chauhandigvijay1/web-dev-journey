import { env } from "../config/env.js";
import { runAutoHunterSweep } from "../services/auto-hunter/scheduler.service.js";
import { getMailOutbox } from "../services/mail.service.js";
import { runReminderSweep } from "../services/reminder.service.js";

export async function runRemindersNow(req, res) {
  const result = await runReminderSweep();
  return res.json({
    success: true,
    data: result,
  });
}

export function readMailOutbox(_req, res) {
  if (env.isProduction) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  return res.json({
    success: true,
    data: {
      messages: getMailOutbox(),
    },
  });
}

export async function runAutoHunterNow(req, res) {
  const result = await runAutoHunterSweep();
  return res.json({
    success: true,
    data: result,
  });
}
