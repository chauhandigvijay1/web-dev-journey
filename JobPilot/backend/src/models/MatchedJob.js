import mongoose from "mongoose";

const matchDetailsSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    qualityLabel: { type: String, trim: true, default: "" },
    reasons: [{ type: String, trim: true }],
    missingSkills: [{ type: String, trim: true }],
    atsKeywordSimilarity: { type: Number, default: 0, min: 0, max: 100 },
    componentScores: {
      skills: { type: Number, default: 0, min: 0, max: 100 },
      experience: { type: Number, default: 0, min: 0, max: 100 },
      role: { type: Number, default: 0, min: 0, max: 100 },
      location: { type: Number, default: 0, min: 0, max: 100 },
      salary: { type: Number, default: 0, min: 0, max: 100 },
      company: { type: Number, default: 0, min: 0, max: 100 },
      freshness: { type: Number, default: 0, min: 0, max: 100 },
      atsKeywords: { type: Number, default: 0, min: 0, max: 100 },
    },
  },
  { _id: false }
);

const matchedJobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    externalJobId: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    locations: [{ type: String, trim: true }],
    country: { type: String, trim: true, default: "" },
    workMode: { type: String, trim: true, default: "" },
    jobType: { type: String, trim: true, default: "" },
    salaryText: { type: String, trim: true, default: "" },
    salaryMin: { type: Number, default: null, min: 0 },
    salaryMax: { type: Number, default: null, min: 0 },
    salaryCurrency: { type: String, trim: true, default: "" },
    experienceText: { type: String, trim: true, default: "" },
    seniorityLevel: { type: String, trim: true, default: "" },
    skills: [{ type: String, trim: true }],
    keywords: [{ type: String, trim: true }],
    descriptionSummary: { type: String, trim: true, default: "" },
    descriptionText: { type: String, trim: true, default: "" },
    source: { type: String, trim: true, default: "" },
    sourceHost: { type: String, trim: true, default: "" },
    originalUrl: { type: String, trim: true, default: "" },
    applyUrl: { type: String, trim: true, default: "" },
    searchQuery: { type: String, trim: true, default: "" },
    searchSnippet: { type: String, trim: true, default: "" },
    postedAt: { type: Date, default: null },
    discoveredAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["new", "emailed", "saved", "dismissed", "tracked"],
      default: "new",
      index: true,
    },
    trackedJob: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
    notifiedAt: { type: Date, default: null },
    match: { type: matchDetailsSchema, required: true },
  },
  { timestamps: true }
);

matchedJobSchema.index({ user: 1, externalJobId: 1 }, { unique: true });
matchedJobSchema.index({ user: 1, status: 1, discoveredAt: -1 });
matchedJobSchema.index({ user: 1, "match.score": -1, discoveredAt: -1 });

export const MatchedJob = mongoose.model("MatchedJob", matchedJobSchema);
