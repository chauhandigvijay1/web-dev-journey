import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSettingsSchema = new mongoose.Schema(
  {
    jobPreferences: {
      preferredJobType: { type: String, trim: true, default: "" },
      preferredLocation: { type: String, trim: true, default: "" },
      expectedSalaryRange: { type: String, trim: true, default: "" },
    },
    productivity: {
      defaultFollowUpDays: { type: Number, default: 5, min: 0, max: 30 },
      autoMarkGhostedDays: { type: Number, default: 21, min: 0, max: 365 },
    },
    notifications: {
      timezone: { type: String, trim: true, default: "UTC" },
      reminderHour: { type: Number, default: 9, min: 0, max: 23 },
      weeklySummaryEnabled: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, default: undefined, select: false },
    googleId: { type: String, unique: true, sparse: true, trim: true, default: undefined },
    hasPassword: { type: Boolean, default: true },
    profilePic: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    emailNotifications: { type: Boolean, default: true },
    settings: { type: userSettingsSchema, default: () => ({}) },
    tokenVersion: { type: Number, default: 0 },
    refreshTokenHash: { type: String, select: false, default: "" },
    refreshSessionId: { type: String, select: false, default: "" },
    refreshTokenExpiresAt: { type: Date, select: false, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = mongoose.model("User", userSchema);
