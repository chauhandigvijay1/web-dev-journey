import mammoth from "mammoth";
import { ResumeProfile } from "../models/ResumeProfile.js";
import { User } from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { groqChat } from "../utils/groq.js";
import { isNonEmptyString } from "../utils/auth.js";

async function extractPdfText(buffer) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse(new Uint8Array(buffer));
    await parser.load();
    const result = await parser.getText();
    return (typeof result === "string" ? result : result?.text) || "";
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
  const prompt = `Extract structured information from this resume text with maximum accuracy. Be thorough and do not skip any information.

CRITICAL RULES:
- "name": Extract the person's FULL name exactly as written (first and last name). If only a first name is present, use it.
- "skills": List every technical/professional skill mentioned. Include programming languages, frameworks, tools, platforms, methodologies, and soft skills where explicitly stated. Examples: React, Python, AWS, Project Management, Data Analysis, Team Leadership, Agile, Docker, Kubernetes, TypeScript, Git, REST APIs, SQL, MongoDB.
- "experience": Each entry MUST include job title, company name, employment dates (month/year), AND key responsibilities/achievements. Format: "Job Title at Company (Month Year - Month Year) - Key achievements and responsibilities".
- "projects": Extract EVERY project mentioned. Each entry MUST include: project name, brief description, technologies used, AND any associated URLs (GitHub link, live demo link, website link, article link). If a URL appears in or near a project description, ALWAYS include it. Format: "Project Name - Description (Technologies: tech1, tech2) (links: github.com/..., demo.com/...)".
- "techStack": List all technologies, frameworks, and tools mentioned across the entire resume (not just skills section).
- "education": Include degree name, institution/university name, graduation year, and any honors. Format: "Degree Name, Institution Name, Year".
- "certifications": Every certification, license, or badge with issuing organization and year. Format: "Certification Name - Issuing Organization (Year)".
- "contactInfo": Extract ALL contact details found — email address (MUST extract exactly as written), phone number (MUST extract digits and formatting), LinkedIn URL, GitHub URL, portfolio URL, Twitter/X handle, any other social links. Pay special attention to URLs embedded in text without explicit labels.
- "phone": Phone numbers can be in any format (with country code, without, with dashes, with spaces). Extract them exactly as they appear.
- "email": Email addresses can appear anywhere in the resume (header, footer, body). Extract all of them, prefer the first one found.
- "links": Extract ALL URLs found ANYWHERE in the resume — personal website, GitHub, LinkedIn, project links, portfolio links, social links, publication links, article links. Include a brief context of what each link is for. Do not miss any URL.
- "languages": Extract all languages mentioned with proficiency level if provided. Format: "Language (Proficiency)".
- "achievements": Extract all achievements, awards, honors, publications, patents mentioned.
- "seniorityLevel": Determine from experience: entry (0-2yr), mid (3-5yr), senior (5-10yr), lead (10-15yr), executive (15+yr).
- "totalYearsExperience": Calculate total professional work experience in years from all roles combined. Be precise.
- "summary": Write a concise 3-4 sentence professional summary based on the resume content.

Return ONLY valid JSON matching this schema exactly:
{
  "name": "Full Name",
  "summary": "3-4 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "experience": ["Job Title at Company (Date - Date) - Achievements"],
  "projects": ["Project Name - Description (Technologies: ...) (links: url)"],
  "techStack": ["tech1", "tech2"],
  "education": ["Degree, Institution, Year"],
  "certifications": ["Certification - Issuer (Year)"],
  "languages": ["Language (Proficiency)"],
  "contactInfo": {
    "email": "email@example.com",
    "phone": "+1-555-123-4567",
    "linkedin": "https://linkedin.com/in/...",
    "github": "https://github.com/...",
    "portfolio": "https://..."
  },
  "links": [
    {"url": "https://...", "context": "what this link is for"}
  ],
  "achievements": ["achievement1"],
  "seniorityLevel": "mid",
  "totalYearsExperience": 5
}

Resume text:
${text.substring(0, 15000)}`;

  const response = await groqChat(
    [
      { role: "system", content: "You are a precise, thorough resume parser. Extract EVERY detail from the resume — do not skip any project, link, skill, or contact detail. Output ONLY valid JSON. CRITICAL: If you see a URL anywhere in the resume, include it in the appropriate field." },
      { role: "user", content: prompt },
    ],
    { max_tokens: 4000, temperature: 0.5 }
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
  let parseStatus = "failed";
  let aiError = "";
  let summary = "";

  /* ---------- AI parsing (if configured) ---------- */
  const hasAI = process.env.GROQ_API_KEY?.trim() ? true : false;
  if (extractedText && hasAI) {
    try {
      parsedData = await parseResumeText(extractedText);
    } catch (e) {
      aiError = e?.message ?? "AI request failed";
    }
  }

  /* ---------- Fallback extraction ---------- */
  if (extractedText) {
    /* --- name (first non-empty line that looks like a name) --- */
    if (!parsedData.name) {
      const nameLine = extractedText.split("\n").find(l => {
        const t = l.trim();
        return t && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(t) && t.length < 50;
      });
      if (nameLine) parsedData.name = nameLine.trim();
    }

    /* --- skills (150+ common skills regex) --- */
    if (!parsedData.skills || parsedData.skills.length === 0) {
      const SKILLS = [
        "React", "Node\\.?js", "MongoDB", "TypeScript", "JavaScript", "Python", "Go", "Rust",
        "AWS", "Docker", "Kubernetes", "PostgreSQL", "Redis", "GraphQL", "Next\\.?js",
        "Tailwind", "CSS", "HTML", "Git", "Linux", "REST", "API", "SQL", "NoSQL",
        "Express", "Flask", "Django", "Vue", "Angular", "Svelte", "Java", "Spring",
        "Spring Boot", "Hibernate", "Kotlin", "Swift", "C\\+\\+", "C#", "\\.NET",
        "PHP", "Laravel", "Symfony", "Ruby", "Rails", "Scala", "Perl", "R",
        "MATLAB", "Solidity", "Terraform", "Ansible", "Jenkins", "GitHub Actions",
        "CircleCI", "Travis CI", "Nginx", "Apache", "RabbitMQ", "Kafka",
        "Elasticsearch", "Logstash", "Kibana", "Prometheus", "Grafana",
        "Datadog", "New Relic", "Sentry", "Jira", "Confluence", "Figma",
        "Adobe XD", "Sketch", "Photoshop", "Illustrator", "Tableau", "Power BI",
        "Looker", "Snowflake", "BigQuery", "Redshift", "Airflow", "Spark",
        "Hadoop", "Hive", "Presto", "dbt", "Dagster", "MLflow", "PyTorch",
        "TensorFlow", "Keras", "scikit-learn", "OpenCV", "NLP", "LangChain",
        "RAG", "LlamaIndex", "Hugging Face", "Ollama", "Helm", "Istio",
        "Envoy", "Consul", "Vault", "gRPC", "Protobuf", "WebSocket",
        "Socket\\.io", "Redux", "Zustand", "Jotai", "Recoil", "React Native",
        "Flutter", "Xamarin", "Unity", "Unreal", "Blender", "Three\\.?js",
        "D3\\.?js", "Chart\\.?js", "Cypress", "Playwright", "Selenium",
        "Jest", "Vitest", "Mocha", "Chai", "Cucumber", "Storybook",
        "ESLint", "Prettier", "Webpack", "Vite", "Parcel", "Rollup",
        "Babel", "ESBuild", "NPM", "Yarn", "pnpm", "Bun", "Deno",
        "Vercel", "Netlify", "Heroku", "Railway", "Supabase", "Firebase",
        "Auth0", "Clerk", "Stripe", "Twilio", "SendGrid", "Cloudinary",
        "S3", "Lambda", "EC2", "ECS", "EKS", "Fargate", "CloudFront",
        "Route53", "CloudFormation", "CDK", "Serverless", "SQS", "SNS",
        "DynamoDB", "Cognito", "Amplify", "AppSync", "Step Functions",
        "Azure", "GCP", "Compute Engine", "Cloud Run", "Cloud Functions",
        "Bigtable", "Spanner", "Datastore", "Pub/Sub", "Dataflow",
        "Agile", "Scrum", "Kanban", "CI/CD", "TDD", "DDD", "Microservices",
        "SOA", "Event-Driven", "CQRS", "Event Sourcing", "OOP", "FP",
        "System Design", "Data Structures", "Algorithms", "Machine Learning",
        "Deep Learning", "Computer Vision", "NLP", "LLM", "GenAI",
        "RAG", "Fine-tuning", "Prompt Engineering", "A/B Testing",
        "Product Management", "Project Management", "Leadership",
        "Team Management", "Mentoring", "Communication", "Presentation",
        "Salesforce", "SAP", "Oracle", "ServiceNow", "Workday",
        "WordPress", "Shopify", "Magento", "Drupal", "Joomla",
        "SEO", "SEM", "Google Analytics", "Google Ads", "Facebook Ads",
        "Content Marketing", "Social Media", "Email Marketing",
        "HubSpot", "Marketo", "Pardot", "Salesforce Marketing Cloud",
        "Bootstrap", "Material UI", "Chakra UI", "shadcn/ui", "Radix UI",
        "Framer Motion", "GSAP", "Anime\\.?js", "jQuery", "Lodash",
        "RxJS", "MobX", "XState", "Elastic Path", "Commercetools",
        "BigCommerce", "WooCommerce", "Strapi", "Contentful", "Sanity",
        "Prisma", "TypeORM", "Sequelize", "Mongoose", "Knex",
        "JWT", "OAuth", "SAML", "LDAP", "SSL/TLS", "HTTPS",
      ];
      const skillRegex = new RegExp(`\\b(?:${SKILLS.join("|")})\\b`, "gi");
      const skillMatches = extractedText.match(skillRegex);
      if (skillMatches) {
        parsedData.skills = [...new Set(skillMatches.map(s => s.trim()))];
      }
    }

    /* --- contact info --- */
    const ci = parsedData.contactInfo ?? {};
    if (!ci.email) {
      const emailMatch = extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) ci.email = emailMatch[0];
    }
    if (!ci.phone) {
      const phoneMatch = extractedText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) ci.phone = phoneMatch[0];
    }
    if (!ci.linkedin) {
      const liMatch = extractedText.match(/linkedin\.com\/[a-zA-Z0-9_-]+/i);
      if (liMatch) ci.linkedin = `https://www.${liMatch[0].toLowerCase()}`;
    }
    if (!ci.github) {
      const ghMatch = extractedText.match(/(?:github\.com\/|github:?\s*)([a-zA-Z0-9_-]+)/i);
      if (ghMatch) ci.github = `https://github.com/${ghMatch[1]}`;
    }
    parsedData.contactInfo = ci;

    /* --- education --- */
    if (!parsedData.education || parsedData.education.length === 0) {
      const eduPatterns = [
        /(?:B\.?Tech|Bachelor|B\.?S(?=\.?c)?|B\.?E|B\.?Sc)\s*(?:in\s*|of\s*)?(?:Computer|Information|Electronics|Electrical|Mechanical|Civil|Data|AI|Machine Learning)?\s*(?:Science|Engineering|Technology|Applications)?\s*(?:,|–|-|at|from)\s*.{1,60}(?:\d{4}|$)/gi,
        /(?:M\.?Tech|Master|M\.?S(?=\.?c)?|M\.?E|M\.?Sc|MBA)\s*(?:in\s*|of\s*)?.{1,40}(?:,|–|-|at|from)\s*.{1,60}(?:\d{4}|$)/gi,
        /(?:PhD|Ph\.?D|Doctorate)\s*(?:in\s*|of\s*)?.{1,50}(?:,|–|-|at|from)\s*.{1,60}(?:\d{4}|$)/gi,
        /(?:High School|12th|10th|SSC|HSC|A-Levels|IB)\s*[,-]\s*.{1,60}(?:\d{4}|$)/gi,
        /(?:University|College|Institute|School)\s*(?:of\s*)?(?:Technology|Engineering|Science|Management|Arts|Commerce|Law|Medical|Design|Business|Computing)?[^.]{0,80}(?:\d{4}|$)/gi,
      ];
      const matched = new Set();
      for (const pattern of eduPatterns) {
        const m = extractedText.match(pattern);
        if (m) m.forEach(e => matched.add(e.trim()));
      }
      if (matched.size > 0) parsedData.education = [...matched];
    }

    /* --- experience --- */
    if (!parsedData.experience || parsedData.experience.length === 0) {
      const expLines = [];
      const lines = extractedText.split("\n");
      let i = 0;
      while (i < lines.length) {
        const line = lines[i].trim();
        if (/(?:20\d{2}|19\d{2})\s*(?:-|–|to|–)\s*(?:(?:20\d{2}|19\d{2}|Present|Current|Now)|$)/i.test(line) &&
            /(?:Engineer|Developer|Manager|Analyst|Designer|Lead|Head|Director|Consultant|Intern|Associate|Specialist|Architect|Administrator|Coordinator|Officer|Executive|Developer|Programmer|Tester|Administrator|Representative|Agent|Clerk|Assistant|Technician|Operator)/i.test(line)) {
          expLines.push(line);
        }
        i++;
      }
      if (expLines.length > 0) parsedData.experience = expLines;
    }
  }

  /* --- determine parse status & summary --- */
  const hasData = parsedData.skills?.length > 0 || parsedData.experience?.length > 0 ||
                  parsedData.education?.length > 0 || parsedData.contactInfo?.email ||
                  parsedData.name;
  parseStatus = hasData ? "completed" : "failed";

  if (!extractedText) {
    summary = "Could not extract text — PDF may be a scanned image (OCR not available)";
  } else if (hasAI && aiError) {
    summary = `AI parsing failed: ${aiError}`;
  } else if (hasAI && hasData) {
    summary = "AI parsing completed";
  } else if (hasAI && !hasData) {
    summary = "AI parsing returned no data";
  } else if (!hasAI && hasData) {
    summary = "Extracted using text analysis (AI not available)";
  } else {
    summary = "Could not extract any information from the resume";
  }

  const profile = await ResumeProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: {
        resumeUrl: url,
        fileName,
        mimeType: mimetype,
        extractedText: extractedText ? extractedText.substring(0, 50000) : "",
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
        lastScanAt: new Date(),
        lastScanStatus: parseStatus,
        lastScanSummary: summary,
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

export async function downloadResume(req, res) {
  const profile = await ResumeProfile.findOne({ user: req.user._id }).lean();
  if (!profile?.resumeUrl) {
    return res.status(404).json({ success: false, message: "No resume found" });
  }

  const fileName = profile.fileName || "resume.pdf";
  try {
    const response = await fetch(profile.resumeUrl);
    if (!response.ok) {
      return res.status(502).json({ success: false, message: "Failed to fetch resume from storage" });
    }
    const mimeType = profile.mimeType || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    response.body.pipe(res);
  } catch {
    return res.status(502).json({ success: false, message: "Failed to fetch resume from storage" });
  }
}

export async function deleteResume(req, res) {
  await ResumeProfile.findOneAndDelete({ user: req.user._id });
  return res.json({ success: true, message: "Resume deleted" });
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
