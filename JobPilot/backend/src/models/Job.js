import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    locations: [{ type: String, trim: true }],
    jobType: { type: String, trim: true, default: "" },
    salary: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    joiningType: { type: String, trim: true, default: "" },
    source: { type: String, trim: true, default: "" },
    expectedSalary: { type: String, trim: true, default: "" },
    offeredSalary: { type: String, trim: true, default: "" },
    companyType: { type: String, trim: true, default: "" },
    confidenceScore: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: "" },
    skills: [{ type: String, trim: true }],
    qualification: { type: String, trim: true, default: "" },
    applyDeadline: { type: Date, default: null },
    workMode: { type: String, trim: true, default: "" },
    descriptionSummary: { type: String, trim: true, default: "" },
    originalApplyLink: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["applied", "interview", "offer", "rejected"],
      default: "applied",
    },
    isPinned: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    isGhosted: { type: Boolean, default: false },
    resumeUrl: { type: String, trim: true, default: "" },
    followUpDate: { type: Date, default: null },
    reminderLastSentAt: { type: Date, default: null },
    reminderLastSentForDate: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

jobSchema.index({ user: 1, status: 1, updatedAt: -1 });
jobSchema.index({ user: 1, followUpDate: 1 });
jobSchema.index({ user: 1, applyDeadline: 1 });

export const Job = mongoose.model("Job", jobSchema);
