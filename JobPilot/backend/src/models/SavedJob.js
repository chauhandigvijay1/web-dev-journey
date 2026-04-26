import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    matchedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatchedJob",
      required: true,
      index: true,
    },
    externalJobId: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    source: { type: String, trim: true, default: "" },
    applyUrl: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

savedJobSchema.index({ user: 1, externalJobId: 1 }, { unique: true });
savedJobSchema.index({ user: 1, savedAt: -1 });

export const SavedJob = mongoose.model("SavedJob", savedJobSchema);
