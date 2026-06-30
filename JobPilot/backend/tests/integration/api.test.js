import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import axios from "axios";
import JSZip from "jszip";
import { app } from "../../src/app.js";
import { ResumeProfile } from "../../src/models/ResumeProfile.js";
import { getMailOutbox } from "../../src/services/mail.service.js";
import { runReminderSweep } from "../../src/services/reminder.service.js";
import * as cloudinaryUpload from "../../src/utils/cloudinaryUpload.js";
import { startTestDatabase, resetTestDatabase, stopTestDatabase } from "../helpers/database.js";

describe("API integration", () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await resetTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  async function registerUser(agent = request.agent(app)) {
    const register = await agent.post("/api/auth/register").send({
      name: "Asha",
      username: `asha${Date.now()}`,
      email: `asha.${Date.now()}@example.com`,
      password: "Secure@123",
      timezone: "UTC",
    });

    return {
      agent,
      token: register.body.data.token,
      register,
    };
  }

  async function createTextDocx(text) {
    const zip = new JSZip();
    zip.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
    );
    zip.folder("_rels").file(
      ".rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    );
    zip.folder("word").file(
      "document.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
    <w:sectPr/>
  </w:body>
</w:document>`
    );

    return zip.generateAsync({ type: "nodebuffer" });
  }

  it("registers, protects routes, and refreshes access tokens", async () => {
    const { agent, token, register } = await registerUser();

    expect(register.status).toBe(201);
    expect(register.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("jobpilot_refresh=")])
    );

    const me = await agent.get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.settings.notifications.timezone).toBe("UTC");

    const refresh = await agent.post("/api/auth/refresh");
    expect(refresh.status).toBe(200);
    expect(refresh.body.data.token).toBeTruthy();

    const unauthorized = await request(app).get("/api/auth/me");
    expect(unauthorized.status).toBe(401);
  });

  it("rejects literal JSON null before auth refresh reaches the route", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Content-Type", "application/json")
      .send("null");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("not valid JSON");
  });

  it("uploads, parses, and stores a multipart resume profile without running an initial scan", async () => {
    const { token } = await registerUser();
    vi.spyOn(cloudinaryUpload, "uploadToCloudinary").mockResolvedValue("https://cdn.example/resume.pdf");

    const resumeText = [
      "Asha Sharma",
      "Software Engineer",
      "Skills: React, Node.js, MongoDB, TypeScript",
      "Experience: 3 years building APIs and dashboards.",
      "Education: Bachelor of Technology",
      "Projects: Built applicant tracking dashboards, REST APIs, analytics charts, and automated reminders.",
      "Preferred roles: Frontend Engineer, Full Stack Developer, Backend Engineer.",
    ].join(" ");

    const response = await request(app)
      .post("/api/career-brain/resume")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", await createTextDocx(resumeText), {
        filename: "resume.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.profile.resumeUrl).toBe("https://cdn.example/resume.pdf");
    expect(response.body.data.profile.fileName).toBe("resume.docx");

    const saved = await ResumeProfile.findOne({ fileName: "resume.docx" }).lean();
    expect(saved?.extractedText).toContain("Software Engineer");
    expect(saved?.parsedData?.skills).toEqual(expect.arrayContaining(["React", "Node.js", "MongoDB"]));
  });

  it("uploads a PDF resume to career brain", async () => {
    const { token } = await registerUser();
    vi.spyOn(cloudinaryUpload, "uploadToCloudinary").mockResolvedValue("https://cdn.example/resume.pdf");

    const pdfBuffer = Buffer.from("%PDF-1.4 test content", "utf-8");

    const response = await request(app)
      .post("/api/career-brain/resume")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", pdfBuffer, { filename: "resume.pdf", contentType: "application/pdf" });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.profile.fileName).toBe("resume.pdf");
  });

  it("creates jobs with enriched fields", async () => {
    const { token } = await registerUser();
    const response = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Platform Engineer",
        company: "Acme",
        location: "Remote",
        locations: ["Remote", "Bengaluru"],
        jobType: "Full-time",
        salary: "20 LPA",
        workMode: "Remote",
        experience: "2+ years",
        skills: ["Node.js", "MongoDB"],
        qualification: "Bachelor's degree",
        descriptionSummary: "Build APIs and distributed systems.",
        originalApplyLink: "https://careers.acme.com/jobs/platform",
        followUpDate: "2026-04-25",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.job.locations).toEqual(["Remote", "Bengaluru"]);
    expect(response.body.data.job.skills).toEqual(["Node.js", "MongoDB"]);
    expect(response.body.data.job.workMode).toBe("Remote");
  });

  it("returns paginated job listings", async () => {
    const { token } = await registerUser();
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Job 1", company: "Acme" });
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Job 2", company: "Acme" });

    const response = await request(app)
      .get("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data.jobs).toHaveLength(1);
    expect(response.body.data.pagination).toEqual({
      page: 1,
      limit: 1,
      total: 2,
      pages: 2,
    });
  });

  it("rejects job creation with empty body", async () => {
    const { token } = await registerUser();
    const response = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects private network URLs in extraction", async () => {
    const { token } = await registerUser();
    const response = await request(app)
      .post("/api/jobs/extract")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "http://localhost:27017/" });
    expect(response.status).toBe(200);
    expect(response.body.data.warning).toContain("private network");
  });

  it("returns health status with DB info", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.db).toBe("connected");
  });

  it("extracts job fields from a fetched public page", async () => {
    const { token } = await registerUser();
    vi.spyOn(axios, "get").mockResolvedValue({
      status: 200,
      data: `
        <html>
          <body>
            <h1>Software Engineer</h1>
            <div class="company-name">Acme</div>
            <div class="job-location">Remote, London</div>
            <div class="salary">$100k - $140k</div>
            <div class="job-description">Skills required: React, Node.js. Experience: 1+ years. Hybrid role.</div>
          </body>
        </html>
      `,
      request: { res: { responseUrl: "https://careers.acme.com/jobs/software-engineer" } },
    });

    const response = await request(app)
      .post("/api/jobs/extract")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://careers.acme.com/jobs/software-engineer" });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Software Engineer");
    expect(response.body.data.company).toBe("Acme");
    expect(response.body.data.skills).toEqual(expect.arrayContaining(["React", "Node.js"]));
  });

  it("runs the reminder email pipeline end-to-end for due jobs", async () => {
    const { token } = await registerUser();
    const createJob = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "QA Engineer",
        company: "Acme",
        followUpDate: "2026-04-23",
      });

    expect(createJob.status).toBe(201);

    const sweep = await runReminderSweep({
      now: new Date("2026-04-23T09:10:00.000Z"),
    });

    expect(sweep.sent).toBe(1);
    expect(getMailOutbox()).toHaveLength(1);
  });
});
