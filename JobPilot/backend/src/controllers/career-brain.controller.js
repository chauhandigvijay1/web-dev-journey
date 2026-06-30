import mammoth from "mammoth";
import { ResumeProfile } from "../models/ResumeProfile.js";
import { User } from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { groqChat } from "../utils/groq.js";
import { isNonEmptyString } from "../utils/auth.js";

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
  const prompt = `Extract structured information from this resume text. Return ONLY valid JSON matching this schema exactly:
{
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "experience": ["experience1", "experience2"],
  "techStack": ["tech1", "tech2"],
  "education": ["education1", "education2"],
  "certifications": ["cert1", "cert2"],
  "seniorityLevel": "entry|mid|senior|lead|executive",
  "totalYearsExperience": 0
}

Resume text:
${text.substring(0, 15000)}`;

  const response = await groqChat(
    [
      { role: "system", content: "You are a precise resume parser. Output ONLY valid JSON." },
      { role: "user", content: prompt },
    ],
    { max_tokens: 2000, temperature: 0.1 }
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
    try {
      const { default: PDFParser } = await import("pdf2json");
      return await new Promise((resolve) => {
        const parser = new PDFParser(null, 1);
        parser.on("pdfParser_dataReady", () => {
          resolve(parser.getRawTextContent() || "");
        });
        parser.on("pdfParser_dataError", () => resolve(""));
        parser.parseBuffer(buffer);
      });
    } catch {
      return "";
    }
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
          ...parsedData,
          githubUrl: "",
          linkedinUrl: "",
          portfolioUrl: "",
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
