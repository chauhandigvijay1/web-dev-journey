import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { app } from "../../src/app.js";
import { getMailOutbox } from "../../src/services/mail.service.js";
import { runReminderSweep } from "../../src/services/reminder.service.js";
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
