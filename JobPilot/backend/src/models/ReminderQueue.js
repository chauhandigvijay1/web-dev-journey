import mongoose from "mongoose";
import { env } from "../config/env.js";

const reminderQueueSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null, index: true },
    type: {
      type: String,
      enum: ["follow_up", "interview", "deadline", "weekly_summary"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "retry", "sent", "cancelled", "failed"],
      default: "pending",
      index: true,
    },
    dedupeKey: { type: String, required: true, unique: true },
    timezone: { type: String, trim: true, default: env.defaultTimezone },
    scheduledFor: { type: Date, required: true, index: true },
    nextAttemptAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0, min: 0 },
    maxAttempts: { type: Number, default: env.reminderRetryLimit, min: 1 },
    lockedAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    lastAttemptAt: { type: Date, default: null },
    lastError: { type: String, trim: true, default: "" },
    payload: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  { timestamps: true }
);

reminderQueueSchema.index({ status: 1, nextAttemptAt: 1 });
reminderQueueSchema.index({ job: 1, status: 1 });
reminderQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

export const ReminderQueue = mongoose.model("ReminderQueue", reminderQueueSchema);
