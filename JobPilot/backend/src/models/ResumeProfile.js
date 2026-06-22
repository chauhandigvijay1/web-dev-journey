import mongoose from "mongoose";

const parsedResumeSchema = new mongoose.Schema(
  {
    summary: { type: String, trim: true, default: "" },
    skills: [{ type: String, trim: true }],
    experience: [{ type: String, trim: true }],
    techStack: [{ type: String, trim: true }],
    preferredRoles: [{ type: String, trim: true }],
    education: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    keywords: [{ type: String, trim: true }],
    seniorityLevel: { type: String, trim: true, default: "" },
    locationPreference: { type: String, trim: true, default: "" },
    totalYearsExperience: { type: Number, default: 0, min: 0, max: 60 },
    suggestedResumeImprovements: [{ type: String, trim: true }],
    parserModel: { type: String, trim: true, default: "" },
    textHash: { type: String, trim: true, default: "" },
    githubUrl: { type: String, trim: true, default: "" },
    linkedinUrl: { type: String, trim: true, default: "" },
    portfolioUrl: { type: String, trim: true, default: "" },
    careerGoals: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const resumeProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    resumeUrl: { type: String, trim: true, default: "" },
    fileName: { type: String, trim: true, default: "" },
    mimeType: { type: String, trim: true, default: "" },
    extractedText: { type: String, trim: true, default: "" },
    parsedData: { type: parsedResumeSchema, default: () => ({}) },
    lastParsedAt: { type: Date, default: null },
    lastScanAt: { type: Date, default: null },
    lastScanStatus: {
      type: String,
      enum: ["idle", "running", "completed", "failed"],
      default: "idle",
    },
    lastScanSummary: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ResumeProfile = mongoose.model("ResumeProfile", resumeProfileSchema);
