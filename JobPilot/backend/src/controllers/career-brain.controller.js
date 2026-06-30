import mammoth from "mammoth";
import { ResumeProfile } from "../models/ResumeProfile.js";
import { User } from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { groqChat } from "../utils/groq.js";
import { isNonEmptyString } from "../utils/auth.js";

async function extractPdfText(buffer) {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch {
    return "";
  }
}

const ACCEPTED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function isValidUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function parseResumeText(text) {
  const prompt = `Extract structured information from this resume text with maximum accuracy.

CRITICAL RULES:
- "name": Extract the person's full name exactly as written (first and last name).
- "skills": ONLY include actual technical/professional skills. NEVER include random words, common English verbs, or generic nouns. Examples of valid skills: React, Python, AWS, Project Management, Data Analysis. Examples of invalid: "team", "work", "experience", "good", "responsible", "ability", "time", "development".
- "experience": Each entry should include job title, company, dates, and key responsibilities/achievements.
- "projects": Each entry should include project name, brief description, and ANY links (GitHub, live demo, website) mentioned with the project. If a URL appears near a project name, include the URL in the description.
- "education": Include degree, institution, graduation year.
- "contactInfo": Extract ALL contact details found — email, phone, LinkedIn URL, GitHub URL, portfolio URL. Pay special attention to URLs embedded in text even without explicit labels.
- "links": Extract ALL URLs found anywhere in the resume — project links, portfolio links, social links, publication links. Include a brief context of what each link is for.

Return ONLY valid JSON matching this schema exactly:
{
  "name": "Full Name",
  "summary": "2-3 sentence professional summary",
  "skills": ["only real technical or professional skills, no random words"],
  "experience": ["Job Title at Company (Date) - Key responsibilities and achievements"],
  "projects": ["Project Name - Brief description (link: url if available)"],
  "techStack": ["tech1", "tech2"],
  "education": ["Degree, Institution, Year"],
  "certifications": ["cert1", "cert2"],
  "languages": ["language1", "language2"],
  "contactInfo": {
    "email": "email if found",
    "phone": "phone if found",
    "linkedin": "linkedin url if found",
    "github": "github url if found",
    "portfolio": "portfolio url if found"
  },
  "links": [
    {"url": "https://...", "context": "what this link is for"}
  ],
  "achievements": ["achievement1", "achievement2"],
  "seniorityLevel": "entry|mid|senior|lead|executive",
  "totalYearsExperience": 0
}

Resume text:
${text.substring(0, 15000)}`;

  const response = await groqChat(
    [
      { role: "system", content: "You are a precise resume parser. Output ONLY valid JSON. CRITICAL: Do NOT fabricate skills. If a word is not clearly a technical or professional skill, do not include it." },
      { role: "user", content: prompt },
    ],
    { max_tokens: 2500, temperature: 0.1 }
  );

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {};
  }
}

async function extractTextFromBuffer(buffer, mimetype) {
  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }
  if (mimetype === "application/pdf") {
    return extractPdfText(buffer);
  }
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch {
      return "";
    }
  }
  return "";
}

export async function getCareerBrain(req, res) {
  let profile = await ResumeProfile.findOne({ user: req.user._id }).lean();
  if (!profile) {
    profile = {
      resumeUrl: "",
      fileName: "",
      parsedData: {},
    };
  }
  return res.json({ success: true, data: { profile } });
}

export async function uploadResumeToCareerBrain(req, res) {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: "Resume file is required" });
  }

  const mimetype = req.file.mimetype;
  if (!ACCEPTED_MIME.has(mimetype)) {
    return res.status(400).json({ success: false, message: "Accepted formats: PDF, DOC, DOCX, TXT" });
  }

  const fileName = req.file.originalname || "resume";

  let url = "";
  try {
    url = await uploadToCloudinary(req.file.buffer, mimetype, fileName);
  } catch (err) {
    if (err.message === "Cloudinary is not configured") {
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.status(502).json({ success: false, message: "Upload failed" });
  }

  const extractedText = await extractTextFromBuffer(req.file.buffer, mimetype);
  let parsedData = {};

  if (extractedText) {
    if (process.env.GROQ_API_KEY?.trim()) {
      try {
        parsedData = await parseResumeText(extractedText);
      } catch {
        // AI parsing is best-effort, use fallback
      }
    }
    if (!parsedData.skills || parsedData.skills.length === 0) {
      const skillMatches = extractedText.match(/\b(?:React|Node\.?js|MongoDB|TypeScript|JavaScript|Python|Go|Rust|AWS|Docker|Kubernetes|PostgreSQL|Redis|GraphQL|Next\.?js|Tailwind|CSS|HTML|Git|Linux|REST|API|SQL|NoSQL|Express|Flask|Django|Vue|Angular|Svelte)\b/gi);
      if (skillMatches) {
        parsedData.skills = [...new Set(skillMatches.map(s => s.trim()))];
      }
    }
  }

  const profile = await ResumeProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: {
        resumeUrl: url,
        fileName,
        mimeType: mimetype,
        extractedText: extractedText.substring(0, 50000),
        parsedData: {
          name: parsedData.name || "",
          summary: parsedData.summary || "",
          skills: parsedData.skills || [],
          experience: parsedData.experience || [],
          projects: parsedData.projects || [],
          techStack: parsedData.techStack || [],
          education: parsedData.education || [],
          certifications: parsedData.certifications || [],
          languages: parsedData.languages || [],
          achievements: parsedData.achievements || [],
          seniorityLevel: parsedData.seniorityLevel || "",
          totalYearsExperience: parsedData.totalYearsExperience || 0,
          contactInfo: parsedData.contactInfo || { email: "", phone: "", linkedin: "", github: "", portfolio: "" },
          links: parsedData.links || [],
          githubUrl: parsedData.contactInfo?.github || "",
          linkedinUrl: parsedData.contactInfo?.linkedin || "",
          portfolioUrl: parsedData.contactInfo?.portfolio || "",
          careerGoals: "",
        },
        lastParsedAt: new Date(),
      },
      $setOnInsert: { user: req.user._id },
    },
    { upsert: true, new: true }
  );

  return res.status(201).json({
    success: true,
    data: { profile },
  });
}

export async function updateCareerBrain(req, res) {
  const body = req.body ?? {};
  const update = {};

  if (Object.prototype.hasOwnProperty.call(body, "githubUrl")) {
    if (body.githubUrl != null && body.githubUrl !== "" && !isValidUrl(body.githubUrl)) {
      return res.status(400).json({ success: false, message: "Invalid GitHub URL" });
    }
    update["parsedData.githubUrl"] = body.githubUrl?.trim() || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "linkedinUrl")) {
    if (body.linkedinUrl != null && body.linkedinUrl !== "" && !isValidUrl(body.linkedinUrl)) {
      return res.status(400).json({ success: false, message: "Invalid LinkedIn URL" });
    }
    update["parsedData.linkedinUrl"] = body.linkedinUrl?.trim() || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "portfolioUrl")) {
    if (body.portfolioUrl != null && body.portfolioUrl !== "" && !isValidUrl(body.portfolioUrl)) {
      return res.status(400).json({ success: false, message: "Invalid Portfolio URL" });
    }
    update["parsedData.portfolioUrl"] = body.portfolioUrl?.trim() || "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "careerGoals")) {
    update["parsedData.careerGoals"] = typeof body.careerGoals === "string" ? body.careerGoals.trim() : "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "skills")) {
    if (!Array.isArray(body.skills)) {
      return res.status(400).json({ success: false, message: "skills must be an array" });
    }
    update["parsedData.skills"] = body.skills.map((s) => String(s).trim()).filter(Boolean);
  }

  if (Object.prototype.hasOwnProperty.call(body, "experience")) {
    if (!Array.isArray(body.experience)) {
      return res.status(400).json({ success: false, message: "experience must be an array" });
    }
    update["parsedData.experience"] = body.experience.map((e) => String(e).trim()).filter(Boolean);
  }

  if (Object.prototype.hasOwnProperty.call(body, "education")) {
    if (!Array.isArray(body.education)) {
      return res.status(400).json({ success: false, message: "education must be an array" });
    }
    update["parsedData.education"] = body.education.map((e) => String(e).trim()).filter(Boolean);
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ success: false, message: "No valid fields to update" });
  }

  const profile = await ResumeProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: update },
    { upsert: true, new: true }
  );

  return res.json({ success: true, data: { profile } });
}
