import mongoose from "mongoose";
import { Job } from "../models/Job.js";
import {
  createJobForUser,
  deleteAllJobsForUser,
  deleteJobForUser,
  extractJobPreview,
  updateJobForUser,
} from "../services/job.service.js";

export async function createJob(req, res) {
  try {
    const job = await createJobForUser(req.user, req.body ?? {});
    return res.status(201).json({ success: true, data: { job } });
  } catch (err) {
    const status = (err && err.statusCode) || 400;
    const message = (err && err.message) || "Could not create job";
    return res.status(status).json({ success: false, message });
  }
}

export async function getJobs(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.originalApplyLink) {
      filter.originalApplyLink = req.query.originalApplyLink;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Could not fetch jobs" });
  }
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
  try {
    const job = await updateJobForUser(req.user, req.params.id, req.body ?? {});
    return res.json({ success: true, data: { job } });
  } catch (err) {
    return res.status(err.statusCode || 400).json({ success: false, message: err.message || "Could not update job" });
  }
}

export async function extractJobFromUrl(req, res) {
  const raw = req.body?.url;
  if (typeof raw !== "string" || !raw.trim()) {
    return res.status(400).json({ success: false, message: "URL is required" });
  }
  try {
    const target = new URL(raw.trim());
    if (!["http:", "https:"].includes(target.protocol)) {
      return res.status(400).json({ success: false, message: "Invalid URL" });
    }
    const extracted = await extractJobPreview(target.href);
    return res.json({ success: true, data: extracted });
  } catch {
    return res.status(400).json({ success: false, message: "Invalid URL" });
  }
}

export async function deleteJob(req, res) {
  try {
    await deleteJobForUser(req.user, req.params.id);
    return res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    return res.status(err.statusCode || 400).json({ success: false, message: err.message || "Could not delete job" });
  }
}

export async function getJobCount(req, res) {
  try {
    const count = await Job.countDocuments({ user: req.user._id });
    return res.json({ success: true, data: { count } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Could not fetch job count" });
  }
}

export async function deleteAllJobs(req, res) {
  if (req.body?.confirm !== true) {
    return res.status(400).json({ success: false, message: "Must send { confirm: true } to delete all jobs" });
  }
  const deletedCount = await deleteAllJobsForUser(req.user);
  return res.json({
    success: true,
    data: {
      deletedCount,
    },
  });
}
