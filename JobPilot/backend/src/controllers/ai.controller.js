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
- For every question you generate, provide a "Contextual Strategy" on HOW the candidate should answer it using their SPECIFIC past experiences, projects, and skills listed in the candidate context.
- Tell the candidate exactly which project or past role to bring up for which question.
- Keep the output concise but high signal.

Required sections:
1. Likely interview rounds
2. HR and recruiter questions (with candidate-specific answer strategy)
3. Role-specific technical questions (with candidate-specific answer strategy)
4. Coding or case-style questions (if relevant)
5. Company-focused signals to prepare
6. Summary of how to position the candidate's background for this specific role

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

export async function generateCoverLetter(req, res) {
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
      skills: job.skills,
      descriptionSummary: job.descriptionSummary,
      notes: job.notes,
    };

    const candidateSnapshot = resumeProfile
      ? {
          summary: resumeProfile.parsedData?.summary || "",
          skills: resumeProfile.parsedData?.skills || [],
          experience: resumeProfile.parsedData?.experience || [],
          careerGoals: resumeProfile.parsedData?.careerGoals || "",
          portfolioUrl: resumeProfile.parsedData?.portfolioUrl || "",
          githubUrl: resumeProfile.parsedData?.githubUrl || "",
        }
      : null;

    const userPrompt = `Draft a highly personalized, compelling cover letter.

Rules:
- Do NOT use generic, robotic phrasing like "I am writing to express my interest in..."
- Hook the reader immediately.
- Map the candidate's specific experience and skills directly to the job's requirements.
- Keep it concise (3-4 paragraphs max).
- If the candidate has specific career goals, weave them in naturally if relevant to the company.
- Include a clear call to action at the end.
- Output ONLY the cover letter text.

Job Context:
${JSON.stringify(jobSnapshot, null, 2)}

Candidate Context:
${JSON.stringify(candidateSnapshot, null, 2)}`;

    const text = await groqChat(
      [
        {
          role: "system",
          content: "You are an expert career strategist drafting a highly persuasive cover letter.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 1000, temperature: 0.4 }
    );

    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function generateResumeTailor(req, res) {
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
      skills: job.skills,
      descriptionSummary: job.descriptionSummary,
    };

    const candidateSnapshot = resumeProfile
      ? {
          summary: resumeProfile.parsedData?.summary || "",
          skills: resumeProfile.parsedData?.skills || [],
          experience: resumeProfile.parsedData?.experience || [],
        }
      : null;

    const userPrompt = `You are an expert ATS optimizer and resume writer.
I need to tailor my resume for this specific job.

Job Context:
${JSON.stringify(jobSnapshot, null, 2)}

My Current Resume Context:
${JSON.stringify(candidateSnapshot, null, 2)}

Provide a highly specific, actionable markdown guide on how to tailor my resume:
1. "New Summary": Write a new 2-3 sentence resume summary tailored exactly to this role.
2. "Keywords to Inject": List exactly which keywords from the job description are missing in my current resume and where to put them.
3. "Experience Tweaks": Give me 3-4 specific bullet points I should rewrite in my experience section to better align with the job requirements, and write the new suggested bullet points for me.
4. "What to remove": Tell me what I should remove to save space.`;

    const text = await groqChat(
      [
        {
          role: "system",
          content: "You are an expert resume writer and ATS optimizer.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 1500, temperature: 0.3 }
    );

    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function generateCompanyIntelligence(req, res) {
  try {
    const { companyName } = req.body ?? {};
    if (!companyName) {
      return res.status(400).json({ success: false, message: "companyName is required" });
    }

    const userPrompt = `I am applying to ${companyName}. Provide a detailed Company Intelligence report in markdown.
Include:
1. Company Overview & Business Model
2. Recent News or Hiring Trends
3. Known Interview Difficulty & Culture
4. Key Engineering/Product Challenges they likely face
5. How a candidate can stand out here`;

    const text = await groqChat(
      [
        {
          role: "system",
          content: "You are an expert career strategist providing company intelligence.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 1500, temperature: 0.3 }
    );

    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function generateRecruiterDiscovery(req, res) {
  try {
    const { companyName } = req.body ?? {};
    if (!companyName) {
      return res.status(400).json({ success: false, message: "companyName is required" });
    }

    const text = await groqChat(
      [
        {
          role: "system",
          content: "You are a recruitment outreach expert.",
        },
        {
          role: "user",
          content: `I am looking to network with recruiters or hiring managers at ${companyName}.
Generate a markdown guide:
1. Search queries I should use on LinkedIn.
2. Email formats typically used by ${companyName} (e.g., first.last@company.com).
3. A short, effective cold outreach message template.`,
        },
      ],
      { max_tokens: 800, temperature: 0.3 }
    );

    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function generateRejectionAnalysis(req, res) {
  try {
    const { jobId } = req.body ?? {};
    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: "Valid job id is required" });
    }

    const [job, resumeProfile] = await Promise.all([
      Job.findOne({ _id: jobId, user: req.user._id }).lean(),
      ResumeProfile.findOne({ user: req.user._id }).lean(),
    ]);

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const jobSnapshot = {
      title: job.title,
      company: job.company,
      skills: job.skills,
    };

    const candidateSnapshot = resumeProfile
      ? {
          skills: resumeProfile.parsedData?.skills || [],
          experience: resumeProfile.parsedData?.experience || [],
        }
      : null;

    const userPrompt = `I was rejected from this role. Provide a supportive, highly analytical markdown report on WHY I might have been rejected.

Job Context:
${JSON.stringify(jobSnapshot, null, 2)}

My Profile:
${JSON.stringify(candidateSnapshot, null, 2)}

Provide:
1. Likely missing skills or gaps in experience.
2. ATS Keywords I probably missed.
3. Next steps on how to improve my profile.`;

    const text = await groqChat(
      [
        {
          role: "system",
          content: "You are an empathetic but highly analytical career coach.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 1200, temperature: 0.4 }
    );

    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function generateCareerStrategyDashboard(req, res) {
  try {
    const resumeProfile = await ResumeProfile.findOne({ user: req.user._id }).lean();
    
    if (!resumeProfile) {
      return res.status(404).json({ success: false, message: "Career Brain not found. Please upload a resume first." });
    }

    const candidateSnapshot = {
      skills: resumeProfile.parsedData?.skills || [],
      experience: resumeProfile.parsedData?.experience || [],
      careerGoals: resumeProfile.careerGoals || "Not specified",
    };

    const userPrompt = `Based on my Career Brain profile, generate a comprehensive Career Strategy Dashboard in markdown.

My Profile:
${JSON.stringify(candidateSnapshot, null, 2)}

Please explicitly answer the following questions with actionable advice:
1. What should I learn next?
2. Which skills am I missing for senior/next-level roles?
3. Which companies should I target based on my background?
4. What is my Career Readiness Score (0-100%)?
5. How close am I to my target salary (if specified)? Provide a realistic estimation of my market value.

Format strictly in clean markdown. Highlight the Readiness Score prominently.`;

    const text = await groqChat(
      [
        {
          role: "system",
          content: "You are a Principal Career Architect and Executive Coach.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 1500, temperature: 0.3 }
    );

    return res.json({ success: true, data: text });
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function importUniversalJob(req, res) {
  try {
    const { html, sourceUrl } = req.body ?? {};
    if (!html) {
      return res.status(400).json({ success: false, message: "HTML content is required" });
    }

    const userPrompt = `Extract the structured job data from the following raw HTML snippet. Provide ONLY a JSON object matching this schema exactly:
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location or Remote",
  "salaryText": "Salary info if any",
  "description": "Full description text",
  "skills": ["skill1", "skill2"]
}

Source URL: ${sourceUrl || "Unknown"}
Content to parse:
${html.substring(0, 20000)}`;

    const text = await groqChat(
      [
        {
          role: "system",
          content: "You are a precise data extraction API. Output ONLY valid JSON.",
        },
        { role: "user", content: userPrompt },
      ],
      { max_tokens: 2000, temperature: 0.1 }
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedData = {};
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch(e) {}
    }

    if (!parsedData.title) {
       return res.status(400).json({ success: false, message: "AI failed to extract job title." });
    }

    const { Job } = await import("../models/Job.js");
    
    const newJob = await Job.create({ 
      user: req.user._id, 
      title: parsedData.title,
      company: parsedData.company || "Unknown",
      location: parsedData.location || "",
      salary: parsedData.salaryText || "",
      descriptionSummary: parsedData.description ? parsedData.description.substring(0, 1000) : "",
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      originalApplyLink: sourceUrl || "", 
      source: "Universal Import",
      status: "applied" 
    });

    return res.json({ success: true, data: newJob });
  } catch (err) {
    return sendAiError(res, err);
  }
}
