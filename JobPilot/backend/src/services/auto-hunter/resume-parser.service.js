import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { env } from "../../config/env.js";
import { groqChat } from "../../utils/groq.js";
import { findExperience, findSkillList } from "../job-extraction/helpers.js";
import {
  cleanText,
  extractJsonObject,
  inferSeniority,
  pickTop,
  splitListValues,
  uniqueStrings,
} from "./helpers.js";

function fallbackResumeSummary(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => cleanText(line, 240))
    .filter(Boolean);

  return cleanText(lines.slice(0, 4).join(" "), 800);
}

function fallbackEducation(text) {
  return pickTop(
    text.match(
      /\b(?:bachelor(?:'s)?|master(?:'s)?|b\.tech|m\.tech|mba|bca|mca|phd|university|college)[^.\n]*/gi
    ) || [],
    4
  );
}

function fallbackCertifications(text) {
  return pickTop(
    text.match(/\b(?:certified|certification|aws|azure|gcp|scrum|pmp)[^.\n]*/gi) || [],
    4
  );
}

function fallbackRoles(text) {
  return pickTop(
    text.match(
      /\b(?:software engineer|frontend engineer|backend engineer|full stack developer|data scientist|product manager|devops engineer|qa engineer|machine learning engineer|ui\/ux designer|intern)\b/gi
    ) || [],
    4
  );
}

function fallbackSuggestedImprovements(parsed) {
  const suggestions = [];

  if (!parsed.summary) {
    suggestions.push("Add a sharper professional summary with role focus and measurable achievements.");
  }
  if ((parsed.skills || []).length < 8) {
    suggestions.push("Expand the skills section with tools, frameworks, databases, and cloud platforms.");
  }
  if ((parsed.preferredRoles || []).length === 0) {
    suggestions.push("Mention target roles explicitly so automated matching can prioritize the right jobs.");
  }
  if (!parsed.locationPreference) {
    suggestions.push("Include your preferred locations or remote preference to improve location matching.");
  }
  if (!parsed.certifications?.length) {
    suggestions.push("List relevant certifications if you have them, especially cloud or platform credentials.");
  }

  return pickTop(suggestions, 5);
}

function normalizeParsedResume(input, extractedText) {
  const summary = cleanText(input.summary || input.profileSummary || input.professionalSummary || "", 1200);
  const skills = uniqueStrings([
    ...splitListValues(input.skills),
    ...splitListValues(input.coreSkills),
    ...findSkillList(extractedText),
  ]);
  const experience = uniqueStrings([
    ...splitListValues(input.experience),
    ...splitListValues(input.experienceHighlights),
  ]);
  const techStack = uniqueStrings([
    ...splitListValues(input.techStack),
    ...splitListValues(input.technologies),
  ]);
  const preferredRoles = uniqueStrings([
    ...splitListValues(input.preferredRoles),
    ...splitListValues(input.roles),
  ]);
  const education = uniqueStrings([
    ...splitListValues(input.education),
    ...fallbackEducation(extractedText),
  ]);
  const certifications = uniqueStrings([
    ...splitListValues(input.certifications),
    ...fallbackCertifications(extractedText),
  ]);
  const keywords = uniqueStrings([
    ...splitListValues(input.keywords),
    ...skills,
    ...techStack,
    ...preferredRoles,
  ]).slice(0, 20);

  const totalYearsExperience = Math.max(
    0,
    Math.min(
      60,
      Number.isFinite(Number(input.totalYearsExperience)) ? Number(input.totalYearsExperience) : 0
    )
  );

  const seniorityLevel = cleanText(
    input.seniorityLevel ||
      inferSeniority(
        [summary, experience.join(" "), preferredRoles.join(" "), extractedText.slice(0, 600)].join(" ")
      ),
    80
  );

  const locationPreference = cleanText(input.locationPreference || input.preferredLocation || "", 120);
  const parserModel = cleanText(input.parserModel || input.model || "", 120);
  const suggestedResumeImprovements = uniqueStrings([
    ...splitListValues(input.suggestedResumeImprovements),
    ...fallbackSuggestedImprovements({
      summary,
      skills,
      preferredRoles,
      certifications,
      locationPreference,
    }),
  ]).slice(0, 6);

  return {
    summary: summary || fallbackResumeSummary(extractedText),
    skills,
    experience: experience.length ? experience : pickTop([findExperience(extractedText)], 3),
    techStack,
    preferredRoles: preferredRoles.length ? preferredRoles : fallbackRoles(extractedText),
    education,
    certifications,
    keywords,
    seniorityLevel,
    locationPreference,
    totalYearsExperience,
    suggestedResumeImprovements,
    parserModel,
  };
}

async function importModule(name) {
  const module = await import(name);
  return module.default ?? module;
}

async function extractPdfText(buffer) {
  try {
    const pdfParse = await importModule("pdf-parse");
    const result = await pdfParse(buffer);
    const parsedText = result?.text?.trim() || "";
    
    // If text is extracted successfully, return it
    if (parsedText.length > 50) {
      return cleanText(parsedText, env.autoHunterResumeMaxChars);
    }
    throw new Error("Text too short, fallback needed");
  } catch {
    // Fallback to pdf2json for LaTeX or complex PDFs
    try {
      const PDFParser = await importModule("pdf2json");
      return await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);
        
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
          const rawText = pdfParser.getRawTextContent();
          resolve(cleanText(rawText || "", env.autoHunterResumeMaxChars));
        });
        
        pdfParser.parseBuffer(buffer);
      });
    } catch {
      const error = new Error("PDF resume could not be parsed");
      error.statusCode = 422;
      throw error;
    }
  }
}

async function extractDocxText(buffer) {
  try {
    const mammoth = await importModule("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return cleanText(result?.value || "", env.autoHunterResumeMaxChars);
  } catch {
    const error = new Error("DOCX resume could not be parsed");
    error.statusCode = 422;
    throw error;
  }
}

async function extractDocText(buffer) {
  const WordExtractor = await importModule("word-extractor");
  const extractor = new WordExtractor();
  const tempPath = path.join(
    os.tmpdir(),
    `jobpilot-resume-${Date.now()}-${Math.random().toString(36).slice(2)}.doc`
  );

  await fs.writeFile(tempPath, buffer);

  try {
    const document = await extractor.extract(tempPath);
    const body =
      document?.getBody?.() ||
      document?.getText?.() ||
      document?.body ||
      document?.text ||
      "";

    return cleanText(body, env.autoHunterResumeMaxChars);
  } catch {
    const error = new Error("DOC resume could not be parsed");
    error.statusCode = 422;
    throw error;
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}

export async function extractResumeText(buffer, mimetype, fileName = "") {
  const lowerName = String(fileName || "").toLowerCase();

  if (mimetype === "application/pdf" || lowerName.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }

  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    return extractDocxText(buffer);
  }

  if (mimetype === "application/msword" || lowerName.endsWith(".doc")) {
    return extractDocText(buffer);
  }

  const error = new Error("Unsupported resume type");
  error.statusCode = 400;
  throw error;
}

export async function parseResumeProfile({
  buffer,
  mimetype,
  fileName = "",
}) {
  const extractedText = await extractResumeText(buffer, mimetype, fileName);
  if (!extractedText) {
    const error = new Error("Resume text could not be extracted");
    error.statusCode = 422;
    throw error;
  }

  const trimmedText = extractedText.slice(0, env.autoHunterResumeMaxChars);

  const prompt = `Analyze this resume and return strict JSON only.

Required JSON shape:
{
  "summary": "string",
  "skills": ["string"],
  "experience": ["string"],
  "techStack": ["string"],
  "preferredRoles": ["string"],
  "education": ["string"],
  "certifications": ["string"],
  "keywords": ["string"],
  "seniorityLevel": "string",
  "locationPreference": "string",
  "totalYearsExperience": 0,
  "suggestedResumeImprovements": ["string"],
  "parserModel": "string"
}

Rules:
- Extract only what is supported by the resume.
- Keep arrays concise and deduplicated.
- Use short phrase values, not paragraphs, except summary.
- Infer preferredRoles and seniorityLevel if the resume implies them.
- suggestedResumeImprovements must contain practical resume advice based on missing clarity, targeting, metrics, or structure.

Resume:
${trimmedText}`;

  let parsed;
  try {
    const response = await groqChat(
      [
        {
          role: "system",
          content:
            "You are an expert technical recruiter and ATS specialist. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.1, max_tokens: 2200, timeoutMs: 12_000 }
    );

    parsed = normalizeParsedResume(extractJsonObject(response), trimmedText);
  } catch {
    parsed = normalizeParsedResume(
      {
        summary: fallbackResumeSummary(trimmedText),
        skills: findSkillList(trimmedText),
        experience: pickTop([findExperience(trimmedText)], 3),
        preferredRoles: fallbackRoles(trimmedText),
        education: fallbackEducation(trimmedText),
        certifications: fallbackCertifications(trimmedText),
      },
      trimmedText
    );
  }

  return {
    extractedText: trimmedText,
    parsedData: parsed,
  };
}
