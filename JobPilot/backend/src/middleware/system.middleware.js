import { env } from "../config/env.js";

export function protectSystemRoute(req, res, next) {
  if (!env.reminderSweepSecret) {
    return res.status(503).json({
      success: false,
      message: "Reminder sweep secret is not configured",
    });
  }

  const provided = req.headers["x-reminder-secret"];
  if (typeof provided !== "string" || provided.trim() !== env.reminderSweepSecret) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  next();
}
