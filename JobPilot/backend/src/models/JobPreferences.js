import mongoose from "mongoose";
import { env } from "../config/env.js";

const salaryExpectationSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    min: { type: Number, default: null, min: 0 },
    max: { type: Number, default: null, min: 0 },
    currency: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const alertSettingsSchema = new mongoose.Schema(
  {
    emailEnabled: { type: Boolean, default: true },
    immediateAlertsEnabled: { type: Boolean, default: true },
    dailyDigestEnabled: { type: Boolean, default: false },
    minimumMatchScore: { type: Number, default: env.autoHunterMinAlertScore, min: 0, max: 100 },
    dailyDigestHour: { type: Number, default: 18, min: 0, max: 23 },
    maxAlertsPerDay: { type: Number, default: 5, min: 1, max: 100 },
  },
  { _id: false }
);

const jobPreferencesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    preferredRoles: [{ type: String, trim: true }],
    workModes: [{ type: String, trim: true }],
    countries: [{ type: String, trim: true }],
    companyPreferences: [{ type: String, trim: true }],
    salaryExpectation: { type: salaryExpectationSchema, default: () => ({}) },
    jobTypes: [{ type: String, trim: true }],
    searchSources: [{ type: String, trim: true }],
    alertSettings: { type: alertSettingsSchema, default: () => ({}) },
    searchEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const JobPreferences = mongoose.model("JobPreferences", jobPreferencesSchema);
