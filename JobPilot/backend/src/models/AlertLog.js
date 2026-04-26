import mongoose from "mongoose";

const alertLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    matchedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatchedJob",
      required: true,
      index: true,
    },
    channel: { type: String, enum: ["email"], required: true },
    type: { type: String, enum: ["instant", "digest"], required: true },
    status: { type: String, enum: ["sent", "skipped", "failed"], required: true },
    dedupeKey: { type: String, required: true, unique: true },
    score: { type: Number, default: 0, min: 0, max: 100 },
    reason: { type: String, trim: true, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

alertLogSchema.index({ user: 1, createdAt: -1 });

export const AlertLog = mongoose.model("AlertLog", alertLogSchema);
