import mongoose from "mongoose";
import axios from "axios";
import { Job } from "../models/Job.js";
import { parseFollowUpDate } from "../utils/followUpDate.js";
import { extractJobFieldsFromHtml } from "../utils/jobPageExtract.js";

const UPDATABLE_FIELDS = [
  "title",
  "company",
  "location",
  "jobType",
  "salary",
  "experience",
  "joiningType",
  "source",
  "expectedSalary",
  "offeredSalary",
  "companyType",
  "confidenceScore",
  "notes",
  "status",
  "isPinned",
  "isImportant",
  "isGhosted",
  "resumeUrl",
  "followUpDate",
];

const STATUS_VALUES = new Set(["applied", "interview", "offer", "rejected"]);

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function str(v) {
  if (v === undefined || v === null) return "";
  return typeof v === "string" ? v.trim() : String(v);
}

export async function createJob(req, res) {
  const b = req.body ?? {};
  if (!isNonEmptyString(b.title)) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }
  if (b.status !== undefined && !STATUS_VALUES.has(b.status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  if (b.confidenceScore !== undefined && b.confidenceScore !== null) {
    const n = Number(b.confidenceScore);
    if (Number.isNaN(n)) {
      return res.status(400).json({ success: false, message: "confidenceScore must be a number" });
    }
  }
  for (const key of ["isPinned", "isImportant", "isGhosted"]) {
    if (b[key] !== undefined && typeof b[key] !== "boolean") {
      return res.status(400).json({ success: false, message: `${key} must be a boolean` });
    }
  }
  let followUpDate = null;
  if (b.followUpDate !== undefined && b.followUpDate !== null && b.followUpDate !== "") {
    const d = parseFollowUpDate(b.followUpDate);
    if (d === undefined) {
      return res.status(400).json({ success: false, message: "Invalid followUpDate" });
    }
    followUpDate = d;
  }

  const job = await Job.create({
    user: req.user._id,
    title: b.title.trim(),
    company: str(b.company),
    location: str(b.location),
    jobType: str(b.jobType),
    salary: str(b.salary),
    experience: str(b.experience),
    joiningType: str(b.joiningType),
    source: str(b.source),
    expectedSalary: str(b.expectedSalary),
    offeredSalary: str(b.offeredSalary),
    companyType: str(b.companyType),
    confidenceScore:
      b.confidenceScore !== undefined && b.confidenceScore !== null
        ? Number(b.confidenceScore)
        : 0,
    notes: str(b.notes),
    status: b.status && STATUS_VALUES.has(b.status) ? b.status : "applied",
    isPinned: typeof b.isPinned === "boolean" ? b.isPinned : false,
    isImportant: typeof b.isImportant === "boolean" ? b.isImportant : false,
    isGhosted: typeof b.isGhosted === "boolean" ? b.isGhosted : false,
    resumeUrl: str(b.resumeUrl),
    followUpDate,
  });

  return res.status(201).json({ success: true, data: { job } });
}

export async function getJobs(req, res) {
  const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: { jobs } });
}

export async function getSingleJob(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid job id" });
  }
  const job = await Job.findOne({ _id: id, user: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  return res.json({ success: true, data: { job } });
}

export async function updateJob(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid job id" });
  }
  const body = req.body ?? {};
  const updates = {};
  for (const key of UPDATABLE_FIELDS) {
    if (body[key] === undefined) continue;
    if (key === "confidenceScore") {
      const n = Number(body[key]);
      if (Number.isNaN(n)) {
        return res.status(400).json({ success: false, message: "confidenceScore must be a number" });
      }
      updates[key] = n;
      continue;
    }
    if (key === "status") {
      if (!STATUS_VALUES.has(body[key])) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      updates[key] = body[key];
      continue;
    }
    if (["isPinned", "isImportant", "isGhosted"].includes(key)) {
      if (typeof body[key] !== "boolean") {
        return res.status(400).json({ success: false, message: `${key} must be a boolean` });
      }
      updates[key] = body[key];
      continue;
    }
    if (key === "followUpDate") {
      const d = parseFollowUpDate(body[key]);
      if (d === undefined && body[key] !== null && body[key] !== "") {
        return res.status(400).json({ success: false, message: "Invalid followUpDate" });
      }
      updates[key] = d ?? null;
      continue;
    }
    if (key === "title") {
      if (!isNonEmptyString(body[key])) {
        return res.status(400).json({ success: false, message: "Title cannot be empty" });
      }
      updates[key] = body[key].trim();
      continue;
    }
    updates[key] = str(body[key]);
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: "No valid fields to update" });
  }
  const job = await Job.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  return res.json({ success: true, data: { job } });
}

export async function extractJobFromUrl(req, res) {
  const raw = req.body?.url;
  if (!isNonEmptyString(raw)) {
    return res.status(400).json({ success: false, message: "URL is required" });
  }
  let target;
  try {
    target = new URL(raw.trim());
  } catch {
    return res.status(400).json({ success: false, message: "Invalid URL" });
  }
  if (!["http:", "https:"].includes(target.protocol)) {
    return res.status(400).json({ success: false, message: "Invalid URL" });
  }
  try {
    const { data, status } = await axios.get(target.href, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobPilot/1.0)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
      validateStatus: () => true,
    });
    if (status < 200 || status >= 400 || typeof data !== "string") {
      return res.status(502).json({ success: false, message: "Could not fetch page" });
    }
    const extracted = extractJobFieldsFromHtml(data);
    return res.json({ success: true, data: extracted });
  } catch (err) {
    const code = err.code;
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
      return res.status(502).json({ success: false, message: "Host not found" });
    }
    if (code === "ETIMEDOUT" || err.message?.toLowerCase().includes("timeout")) {
      return res.status(502).json({ success: false, message: "Request timed out" });
    }
    return res.status(502).json({ success: false, message: "Could not fetch page" });
  }
}

export async function deleteJob(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid job id" });
  }
  const job = await Job.findOneAndDelete({ _id: id, user: req.user._id });
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  return res.json({ success: true, data: { deleted: true } });
}

export async function deleteAllJobs(req, res) {
  const result = await Job.deleteMany({ user: req.user._id });
  return res.json({
    success: true,
    data: {
      deletedCount: result.deletedCount ?? 0,
    },
  });
}
