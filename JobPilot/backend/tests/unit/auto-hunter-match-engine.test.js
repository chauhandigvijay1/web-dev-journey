import { describe, expect, it } from "vitest";
import { scoreCandidateForUser } from "../../src/services/auto-hunter/match-engine.service.js";

describe("auto hunter match engine", () => {
  it("scores strong matches higher and reports missing skills", () => {
    const resumeProfile = {
      parsedData: {
        skills: ["Node.js", "MongoDB", "React", "TypeScript"],
        techStack: ["AWS", "Redis"],
        keywords: ["backend", "api", "remote"],
        preferredRoles: ["Backend Engineer", "Platform Engineer"],
        seniorityLevel: "Mid",
        totalYearsExperience: 3,
        locationPreference: "India",
      },
    };

    const preferences = {
      preferredRoles: ["Backend Engineer"],
      workModes: ["remote"],
      countries: ["India"],
      companyPreferences: ["Atlassian"],
      salaryExpectation: {
        label: "18-28 LPA",
        min: 1_800_000,
        max: 2_800_000,
        currency: "INR",
      },
      alertSettings: {
        minimumMatchScore: 72,
      },
    };

    const candidate = {
      title: "Senior Backend Engineer",
      company: "Atlassian",
      location: "Remote, India",
      locations: ["Remote", "India"],
      country: "India",
      workMode: "remote",
      jobType: "full-time",
      salaryText: "20-26 LPA",
      salaryMin: 2_000_000,
      salaryMax: 2_600_000,
      experienceText: "3+ years",
      seniorityLevel: "Senior",
      skills: ["Node.js", "MongoDB", "Kafka", "Redis"],
      keywords: ["node.js", "backend", "distributed systems"],
      descriptionSummary: "Build backend systems and APIs for global products.",
      descriptionText: "Strong Node.js, MongoDB, Redis, and Kafka experience required.",
      postedAt: new Date().toISOString(),
      discoveredAt: new Date().toISOString(),
    };

    const scored = scoreCandidateForUser(candidate, resumeProfile, preferences);
    expect(scored.score).toBeGreaterThanOrEqual(70);
    expect(scored.qualityLabel).toBe("Promising");
    expect(scored.missingSkills).toContain("Kafka");
    expect(scored.componentScores.skills).toBeGreaterThanOrEqual(70);
    expect(scored.reasons.length).toBeGreaterThan(0);
  });
});
