import mongoose from "mongoose";
import { Job } from "../models/Job.js";
import { ResumeProfile } from "../models/ResumeProfile.js";
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

export async function generateInterviewQuestions(req, res) {
  try {
    const { jobId } = req.body ?? {};
    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: "Valid job id is required" });
    }

    const [job, resumeProfile] = await Promise.all([
      Job.findOne({ _id: jobId, user: req.user._id }).lean(),
      ResumeProfile.findOne({ user: req.user._id }).lean(),
    ]);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobSnapshot = {
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      workMode: job.workMode,
      source: job.source,
      experience: job.experience,
      skills: job.skills,
      qualification: job.qualification,
      companyType: job.companyType,
      descriptionSummary: job.descriptionSummary,
      notes: job.notes,
    };

    const candidateSnapshot = resumeProfile
      ? {
          summary: resumeProfile.parsedData?.summary || "",
          skills: resumeProfile.parsedData?.skills || [],
          techStack: resumeProfile.parsedData?.techStack || [],
          preferredRoles: resumeProfile.parsedData?.preferredRoles || [],
          seniorityLevel: resumeProfile.parsedData?.seniorityLevel || "",
          totalYearsExperience: resumeProfile.parsedData?.totalYearsExperience || 0,
        }
      : null;

    const userPrompt = `Generate a company-specific and role-specific interview preparation pack in markdown.

Rules:
- Do not write generic filler.
- Anchor every question to the job title, company, seniority, skills, and job context below.
- If company-specific detail is inferred rather than explicit, say "Inferred from company/role context".
- Include strong answer direction for each important question.
- Keep the output concise but high signal.

Required sections:
1. Likely interview rounds
2. HR and recruiter questions
3. Role-specific technical questions
4. Coding or case-style questions (if relevant)
5. Company-focused signals to prepare
6. Strong answer strategy

Job context:
${JSON.stringify(jobSnapshot, null, 2)}

Candidate context:
${JSON.stringify(candidateSnapshot, null, 2)}`;

    const text = await groqChat(
      [
        {
          role: "system",
          content:
            "You are an expert interview coach. Produce tailored interview prep grounded in the supplied job and candidate context.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 1800, temperature: 0.2 }
    );

    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}
