import http from "node:http";

const html = `
  <!doctype html>
  <html>
    <head>
      <title>Automation QA Engineer</title>
      <meta property="og:site_name" content="Acme Careers" />
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": "Automation QA Engineer",
          "hiringOrganization": { "@type": "Organization", "name": "Acme Careers" },
          "employmentType": "Full-time",
          "jobLocation": [
            { "@type": "Place", "address": { "addressLocality": "Remote" } },
            { "@type": "Place", "address": { "addressLocality": "Bengaluru" } }
          ],
          "baseSalary": "18-24 LPA",
          "validThrough": "2026-12-31",
          "description": "Build automated quality workflows. Skills required: Playwright, TypeScript, API Testing. Experience: 2+ years. Hybrid role. Qualification: Bachelor's degree."
        }
      </script>
    </head>
    <body>
      <main>
        <h1>Automation QA Engineer</h1>
        <p class="company-name">Acme Careers</p>
        <p class="job-location">Remote, Bengaluru</p>
        <a href="/apply/qa">Apply now</a>
      </main>
    </body>
  </html>
`;

const server = http.createServer((req, res) => {
  if (req.url === "/job-posting") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (req.url === "/apply/qa") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("Apply");
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(4010, "127.0.0.1");
