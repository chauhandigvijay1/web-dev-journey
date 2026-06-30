import { describe, expect, it } from "vitest";
import { extractJobFieldsFromHtml } from "../../src/services/job-extraction/index.js";

describe("job extraction", () => {
  it("reads schema.org JobPosting fields", () => {
    const html = `
      <html>
        <head>
          <title>Senior Backend Engineer</title>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "JobPosting",
              "title": "Senior Backend Engineer",
              "hiringOrganization": { "@type": "Organization", "name": "Acme Labs" },
              "employmentType": "Full-time",
              "jobLocation": [
                { "@type": "Place", "address": { "addressLocality": "Bengaluru", "addressCountry": "IN" } },
                { "@type": "Place", "address": { "addressLocality": "Remote" } }
              ],
              "baseSalary": "20-28 LPA",
              "qualifications": "Bachelor's degree in Computer Science",
              "validThrough": "2026-05-10",
              "description": "Build APIs. Skills required: Node.js, MongoDB, Redis. Experience: 3+ years. Hybrid role."
            }
          </script>
        </head>
        <body>
          <h1>Senior Backend Engineer</h1>
        </body>
      </html>
    `;

    const extracted = extractJobFieldsFromHtml(html, "https://careers.acme.com/jobs/123");
    expect(extracted.title).toBe("Senior Backend Engineer");
    expect(extracted.company).toBe("Acme Labs");
    expect(extracted.locations).toContain("Bengaluru");
    expect(extracted.salary).toContain("20-28 LPA");
    expect(extracted.jobType).toBe("Full-time");
    expect(extracted.qualification).toContain("Bachelor");
    expect(extracted.originalApplyLink).toBe("https://careers.acme.com/jobs/123");
  });

  it("rejects private network URLs", async () => {
    const { extractJobFieldsFromUrl } = await import("../../src/services/job-extraction/index.js");

    const localhost = await extractJobFieldsFromUrl("http://localhost:27017/");
    expect(localhost.warning).toContain("private network");

    const privateIp = await extractJobFieldsFromUrl("http://192.168.1.1/admin");
    expect(privateIp.warning).toContain("private network");

    const nonHttp = await extractJobFieldsFromUrl("ftp://example.com/file");
    expect(nonHttp.warning).toContain("http and https");

    const invalid = await extractJobFieldsFromUrl("not-a-url");
    expect(invalid.warning).toContain("Invalid URL");
  });

  it("uses domain and fallback selectors for public job pages", () => {
    const html = `
      <html>
        <head>
          <meta property="og:site_name" content="Wellfound" />
        </head>
        <body>
          <div data-test="job-title">Product Engineer</div>
          <div data-test="startup-name">Rocket Labs</div>
          <div data-test="job-location">Remote, New York</div>
          <div data-test="job-salary">$120k - $160k</div>
          <main>
            Product Engineer role. Skills required: React, TypeScript, GraphQL.
            Qualification: Bachelor's degree.
            Experience: 2+ years.
            Remote role.
          </main>
          <a data-test="apply-button" href="/apply/abc">Apply</a>
        </body>
      </html>
    `;

    const extracted = extractJobFieldsFromHtml(html, "https://wellfound.com/jobs/product-engineer");
    expect(extracted.title).toBe("Product Engineer");
    expect(extracted.company).toBe("Rocket Labs");
    expect(extracted.salary).toContain("$120k");
    expect(extracted.skills).toEqual(expect.arrayContaining(["React", "TypeScript", "GraphQL"]));
    expect(extracted.experience).toContain("2+");
    expect(extracted.workMode.toLowerCase()).toContain("remote");
    expect(extracted.originalApplyLink).toBe("https://wellfound.com/apply/abc");
  });
});
