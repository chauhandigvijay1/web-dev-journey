import mongoose from "mongoose";
import { Job } from "../models/Job.js";
import { groqChat } from "../utils/groq.js";

function sendAiError(res, err) {
  const code = err.statusCode ?? 500;
  const message = err.message || "AI request failed";
  return res.status(code).json({ success: false, message });
}

export async function generateFollowUpEmail(req, res) {
  try {
    const { title, company, notes } = req.body ?? {};
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    const userPrompt = `Write a concise, professional follow-up email for a job application.

Job title: ${title.trim()}
Company: ${typeof company === "string" && company.trim() ? company.trim() : "Not specified"}
Notes / context: ${typeof notes === "string" && notes.trim() ? notes.trim() : "None"}

Output only the email body (from greeting through sign-off). Do not include a subject line.`;

    const text = await groqChat(
      [
        {
          role: "system",
          content:
            "You help job seekers write clear, polite, professional follow-up emails. Keep a neutral, confident tone.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 1200 }
    );
    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function summarizeJob(req, res) {
  try {
    const { jobId } = req.body ?? {};
    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: "Valid job id is required" });
    }
    const job = await Job.findOne({ _id: jobId, user: req.user._id }).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const snapshot = {
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      salary: job.salary,
      expectedSalary: job.expectedSalary,
      offeredSalary: job.offeredSalary,
      status: job.status,
      companyType: job.companyType,
      confidenceScore: job.confidenceScore,
      notes: job.notes,
      experience: job.experience,
      joiningType: job.joiningType,
      source: job.source,
    };
    const userPrompt = `Produce a short structured summary of this job application. Use markdown with clear headings and bullet points where helpful. Sections: Overview, Role & compensation, Status & notes, Suggested next steps.

Application data:
${JSON.stringify(snapshot, null, 2)}`;

    const text = await groqChat(
      [
        {
          role: "system",
          content: "You summarize job application records clearly and concisely for the candidate.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 1500 }
    );
    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}
