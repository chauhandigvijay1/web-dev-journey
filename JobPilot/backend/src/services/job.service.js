import mongoose from "mongoose";
import { Job } from "../models/Job.js";
import { parseFollowUpDate } from "../utils/followUpDate.js";
import { cancelAllJobReminders, cancelJobReminders, syncJobReminders } from "./reminder.service.js";
import { extractJobFieldsFromUrl } from "./job-extraction/index.js";

export const JOB_STATUS_VALUES = new Set(["saved", "applied", "oa", "interview", "offer", "rejected"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value, maxLength = 500) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, maxLength);
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((item) => normalizeString(item, 120))
          .filter(Boolean)
      )
    );
  }

  return Array.from(
    new Set(
      String(value)
        .split(/\n|,|;|\|/)
        .map((item) => normalizeString(item, 120))
        .filter(Boolean)
    )
  );
}

function isPrivateHostname(hostname) {
  const normalized = hostname.replace(/^www\./, "").toLowerCase();
  if (/^0x[0-9a-f]+$/i.test(normalized) || /^0[0-7]+$/.test(normalized)) return true;
  const num = Number(hostname);
  if (Number.isFinite(num) && !/^0[box]/i.test(hostname)) return true;
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "0.0.0.0" ||
    /^127\.\d+\.\d+\.\d+$/.test(normalized) ||
    /^10\.\d+\.\d+\.\d+$/.test(normalized) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(normalized) ||
    /^192\.168\.\d+\.\d+$/.test(normalized) ||
    /^169\.254\.\d+\.\d+$/.test(normalized)
  );
}

function isIpv6Hostname(hostname) {
  return hostname.startsWith("[") && hostname.endsWith("]");
}

function normalizeOptionalUrl(value, fieldName) {
  const candidate = normalizeString(value, 1000);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { _error: `${fieldName || "URL"} must be an http or https URL` };
    }
    if (isPrivateHostname(url.hostname)) {
      return { _error: `${fieldName || "URL"} points to a private or internal network` };
    }
    if (isIpv6Hostname(url.hostname)) {
      return { _error: `${fieldName || "URL"} uses IPv6 which is not supported` };
    }
    return url.href;
  } catch {
    return { _error: `${fieldName || "URL"} is not a valid URL` };
  }
}

function normalizeSource(value) {
  const raw = normalizeString(value, 240);
  if (!raw) return "";

  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}

function normalizeOptionalDate(value) {
  const parsed = parseFollowUpDate(value);
  if (parsed === undefined) return undefined;
  return parsed ?? null;
}

export function normalizeJobPayload(body = {}, { partial = false } = {}) {
  const payload = {};

  if (!partial || Object.prototype.hasOwnProperty.call(body, "title")) {
    if (!isNonEmptyString(body.title)) {
      return { error: "Title is required" };
    }
    payload.title = normalizeString(body.title, 200);
  }

  if (!partial || body.company !== undefined) payload.company = normalizeString(body.company, 200);
  if (!partial || body.location !== undefined) payload.location = normalizeString(body.location, 240);
  if (!partial || body.locations !== undefined) payload.locations = normalizeStringArray(body.locations);
  if (!partial || body.jobType !== undefined) payload.jobType = normalizeString(body.jobType, 120);
  if (!partial || body.salary !== undefined) payload.salary = normalizeString(body.salary, 180);
  if (!partial || body.experience !== undefined) payload.experience = normalizeString(body.experience, 120);
  if (!partial || body.joiningType !== undefined) payload.joiningType = normalizeString(body.joiningType, 120);
  if (!partial || body.source !== undefined) payload.source = normalizeSource(body.source);
  if (!partial || body.expectedSalary !== undefined) payload.expectedSalary = normalizeString(body.expectedSalary, 180);
  if (!partial || body.offeredSalary !== undefined) payload.offeredSalary = normalizeString(body.offeredSalary, 180);
  if (!partial || body.companyType !== undefined) payload.companyType = normalizeString(body.companyType, 120);
  if (!partial || body.notes !== undefined) payload.notes = normalizeString(body.notes, 4000);
  if (!partial || body.resumeUrl !== undefined) {
    const rv = normalizeOptionalUrl(body.resumeUrl, "resumeUrl");
    if (rv && typeof rv === "object" && rv._error) return { error: rv._error };
    payload.resumeUrl = rv;
  }
  if (!partial || body.qualification !== undefined) payload.qualification = normalizeString(body.qualification, 400);
  if (!partial || body.workMode !== undefined) payload.workMode = normalizeString(body.workMode, 120);
  if (!partial || body.descriptionSummary !== undefined) payload.descriptionSummary = normalizeString(body.descriptionSummary, 1200);
  if (!partial || body.originalApplyLink !== undefined) {
    const ov = normalizeOptionalUrl(body.originalApplyLink, "originalApplyLink");
    if (ov && typeof ov === "object" && ov._error) return { error: ov._error };
    payload.originalApplyLink = ov;
  }
  if (!partial || body.skills !== undefined) payload.skills = normalizeStringArray(body.skills);

  if (!partial || body.confidenceScore !== undefined) {
    const value = Number(body.confidenceScore ?? 0);
    if (!Number.isFinite(value)) {
      return { error: "confidenceScore must be a number" };
    }
    payload.confidenceScore = Math.max(0, Math.min(100, Math.round(value)));
  }

  if (!partial || body.status !== undefined) {
    const value = body.status == null || body.status === "" ? "saved" : normalizeString(body.status, 40).toLowerCase();
    if (!JOB_STATUS_VALUES.has(value)) {
      return { error: "Invalid status" };
    }
    payload.status = value;
  }

  for (const key of ["isPinned", "isImportant", "isGhosted"]) {
    if (!partial || body[key] !== undefined) {
      if (body[key] !== undefined && typeof body[key] !== "boolean") {
        return { error: `${key} must be a boolean` };
      }
      payload[key] = normalizeBoolean(body[key], false);
    }
  }

  if (!partial || body.followUpDate !== undefined) {
    const followUpDate = normalizeOptionalDate(body.followUpDate);
    if (followUpDate === undefined && body.followUpDate !== undefined) {
      return { error: "Invalid followUpDate" };
    }
    payload.followUpDate = followUpDate;
  }

  if (!partial || body.applyDeadline !== undefined) {
    const applyDeadline = normalizeOptionalDate(body.applyDeadline);
    if (applyDeadline === undefined && body.applyDeadline !== undefined) {
      return { error: "Invalid applyDeadline" };
    }
    payload.applyDeadline = applyDeadline;
  }

  if (payload.locations?.length && !payload.location) {
    payload.location = payload.locations.join(", ");
  }

  return { data: payload };
}

export async function createJobForUser(user, body) {
  const normalized = normalizeJobPayload(body, { partial: false });
  if (normalized.error) {
    const error = new Error(normalized.error);
    error.statusCode = 400;
    throw error;
  }

  const job = await Job.create({
    user: user._id,
    status: "saved",
    confidenceScore: 0,
    ...normalized.data,
  });

  await syncJobReminders(job, user);
  return job;
}

export async function updateJobForUser(user, id, body) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid job id");
    error.statusCode = 400;
    throw error;
  }

  const normalized = normalizeJobPayload(body, { partial: true });
  if (normalized.error) {
    const error = new Error(normalized.error);
    error.statusCode = 400;
    throw error;
  }

  if (Object.keys(normalized.data).length === 0) {
    const error = new Error("No valid fields to update");
    error.statusCode = 400;
    throw error;
  }

  const job = await Job.findOneAndUpdate(
    { _id: id, user: user._id },
    { $set: normalized.data },
    { new: true, runValidators: true }
  );

  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  const shouldSyncReminders = ["followUpDate", "applyDeadline", "status"].some((key) =>
    Object.prototype.hasOwnProperty.call(normalized.data, key)
  );
  if (shouldSyncReminders) {
    await syncJobReminders(job, user);
  }
  return job;
}

export async function deleteJobForUser(user, id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid job id");
    error.statusCode = 400;
    throw error;
  }

  const job = await Job.findOneAndDelete({ _id: id, user: user._id });
  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  await cancelJobReminders(job._id);
  return job;
}

export async function deleteAllJobsForUser(user) {
  const jobs = await Job.find({ user: user._id }).select("_id").lean();
  const result = await Job.deleteMany({ user: user._id });
  await cancelAllJobReminders(jobs.map((job) => job._id));
  return result.deletedCount ?? 0;
}

export async function extractJobPreview(urlString) {
  return extractJobFieldsFromUrl(urlString);
}
