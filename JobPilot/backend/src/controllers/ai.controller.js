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

export async function scoreAtsForJob(req, res) {
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

    if (!resumeProfile || !resumeProfile.parsedData?.skills?.length) {
      return res.status(400).json({ success: false, message: "No resume profile found. Upload your resume first." });
    }

    const jobSnapshot = {
      title: job.title,
      company: job.company,
      skills: job.skills,
      descriptionSummary: job.descriptionSummary,
      qualification: job.qualification,
      experience: job.experience,
    };

    const candidateSnapshot = {
      summary: resumeProfile.parsedData?.summary || "",
      skills: resumeProfile.parsedData?.skills || [],
      experience: resumeProfile.parsedData?.experience || [],
      techStack: resumeProfile.parsedData?.techStack || [],
      education: resumeProfile.parsedData?.education || [],
      certifications: resumeProfile.parsedData?.certifications || [],
      totalYearsExperience: resumeProfile.parsedData?.totalYearsExperience || 0,
    };

    const prompt = `You are an expert ATS (Applicant Tracking System) evaluator. Analyze how well this candidate's resume matches this specific job.

Return ONLY valid JSON with this exact schema:
{
  "atsScore": 0-100,
  "breakdown": {
    "skillsMatch": "score 0-100 with explanation",
    "experienceMatch": "score 0-100 with explanation",
    "educationMatch": "score 0-100 with explanation",
    "keywordsMatch": "score 0-100 with explanation"
  },
  "matchingSkills": ["skill that matches"],
  "missingSkills": ["skill in job but not in resume"],
  "extraSkills": ["skill in resume but not required by job"],
  "strengths": ["key strength for this role"],
  "gaps": ["gap that needs addressing"],
  "recommendations": [
    "specific actionable recommendation to improve match",
    "another recommendation"
  ],
  "suggestedRoles": ["alternative job titles matching this resume better"]
}

Job Requirements:
${JSON.stringify(jobSnapshot, null, 2)}

Candidate Resume:
${JSON.stringify(candidateSnapshot, null, 2)}`;

    const response = await groqChat(
      [
        { role: "system", content: "You are an expert ATS evaluator and career coach. Output ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      { max_tokens: 2000, temperature: 0.2 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ success: true, data: { atsScore: 0, error: "Could not parse ATS result" } });
    }

    try {
      const result = JSON.parse(jsonMatch[0]);
      return res.json({ success: true, data: result });
    } catch {
      return res.json({ success: true, data: { atsScore: 0, error: "Could not parse ATS result" } });
    }
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function getJobRecommendations(req, res) {
  try {
    const resumeProfile = await ResumeProfile.findOne({ user: req.user._id }).lean();

    if (!resumeProfile || !resumeProfile.parsedData?.skills?.length) {
      return res.status(400).json({ success: false, message: "No resume profile found. Upload your resume first." });
    }

    const candidateSnapshot = {
      summary: resumeProfile.parsedData?.summary || "",
      skills: resumeProfile.parsedData?.skills || [],
      experience: resumeProfile.parsedData?.experience || [],
      projects: resumeProfile.parsedData?.projects || [],
      techStack: resumeProfile.parsedData?.techStack || [],
      education: resumeProfile.parsedData?.education || [],
      certifications: resumeProfile.parsedData?.certifications || [],
      seniorityLevel: resumeProfile.parsedData?.seniorityLevel || "",
      totalYearsExperience: resumeProfile.parsedData?.totalYearsExperience || 0,
    };

    const prompt = `Based on this candidate's resume, recommend suitable job roles and career paths.

Return ONLY valid JSON with this exact schema:
{
  "recommendedRoles": [
    {
      "title": "Job title",
      "matchPercentage": 0-100,
      "reason": "Why this role fits",
      "missingSkills": ["skill to acquire"],
      "suggestedIndustries": ["industry1", "industry2"],
      "averageSalaryRange": "expected salary range for this role"
    }
  ],
  "careerPathSuggestions": [
    {
      "direction": "career direction",
      "timeframe": "6-12 months / 1-2 years / long term",
      "skillsToLearn": ["skill"],
      "potentialRoles": ["role after this direction"]
    }
  ],
  "skillDevelopmentPlan": {
    "immediate": ["skill to learn in next 30 days"],
    "shortTerm": ["skill to learn in 3-6 months"],
    "longTerm": ["skill to learn in 1+ years"]
  }
}

Candidate Resume:
${JSON.stringify(candidateSnapshot, null, 2)}`;

    const response = await groqChat(
      [
        { role: "system", content: "You are an expert career counselor and job market analyst. Output ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      { max_tokens: 2500, temperature: 0.3 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ success: true, data: { recommendedRoles: [], careerPathSuggestions: [], skillDevelopmentPlan: {} } });
    }

    try {
      return res.json({ success: true, data: JSON.parse(jsonMatch[0]) });
    } catch {
      return res.json({ success: true, data: { recommendedRoles: [], careerPathSuggestions: [], skillDevelopmentPlan: {} } });
    }
  } catch (err) {
    return sendAiError(res, err);
  }
}

export async function analyzeSkillGap(req, res) {
  try {
    const { jobDescription } = req.body ?? {};
    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ success: false, message: "Job description is required" });
    }

    const resumeProfile = await ResumeProfile.findOne({ user: req.user._id }).lean();

    if (!resumeProfile || !resumeProfile.parsedData?.skills?.length) {
      return res.status(400).json({ success: false, message: "No resume profile found. Upload your resume first." });
    }

    const candidateSnapshot = {
      summary: resumeProfile.parsedData?.summary || "",
      skills: resumeProfile.parsedData?.skills || [],
      experience: resumeProfile.parsedData?.experience || [],
      projects: resumeProfile.parsedData?.projects || [],
      techStack: resumeProfile.parsedData?.techStack || [],
      education: resumeProfile.parsedData?.education || [],
      certifications: resumeProfile.parsedData?.certifications || [],
    };

    const prompt = `Analyze the skill gap between this candidate's resume and the provided job description.

Return ONLY valid JSON with this exact schema:
{
  "matchingSkills": ["skill present in both resume and job description"],
  "missingSkills": ["skill required by job but missing from resume"],
  "extraSkills": ["skill in resume not mentioned in job description"],
  "matchPercentage": 0-100,
  "recommendations": [
    "specific actionable recommendation to close the gap",
    "another recommendation"
  ],
  "suggestedCourses": ["online course or resource recommendation for each missing skill"]
}

Candidate Resume:
${JSON.stringify(candidateSnapshot, null, 2)}

Job Description:
${jobDescription.trim().substring(0, 10000)}`;

    const response = await groqChat(
      [
        { role: "system", content: "You are an expert skill gap analyst and career development advisor. Output ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      { max_tokens: 2000, temperature: 0.2 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ success: true, data: { matchingSkills: [], missingSkills: [], matchPercentage: 0, recommendations: [] } });
    }

    try {
      return res.json({ success: true, data: JSON.parse(jsonMatch[0]) });
    } catch {
      return res.json({ success: true, data: { matchingSkills: [], missingSkills: [], matchPercentage: 0, recommendations: [] } });
    }
  } catch (err) {
    return sendAiError(res, err);
  }
}
