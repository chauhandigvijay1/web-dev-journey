import http from "node:http";

const PORT = 4010;

const JOB_POSTING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Senior Software Engineer at Acme Corp</title>
  <meta property="og:title" content="Senior Software Engineer">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "Senior Software Engineer",
    "hiringOrganization": { "@type": "Organization", "name": "Acme Corp" },
    "jobLocation": { "@type": "Place", "address": { "addressLocality": "San Francisco, CA" } },
    "description": "We are looking for a Senior Software Engineer to join our team.",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"]
  }
  </script>
</head>
<body>
  <h1 class="job-title">Senior Software Engineer</h1>
  <div class="company-name">Acme Corp</div>
  <div class="location">San Francisco, CA</div>
  <div id="job-description">
    <p>We are looking for a Senior Software Engineer to join our team and build the next generation of our platform.</p>
    <h2>Requirements</h2>
    <ul>
      <li>5+ years of experience</li>
      <li>Strong knowledge of JavaScript/TypeScript</li>
      <li>Experience with React and Node.js</li>
    </ul>
  </div>
</body>
</html>`;

const NOT_A_JOB_HTML = `<!DOCTYPE html>
<html lang="en">
<head><title>Google</title></head>
<body>
  <h1>Google Search</h1>
  <p>Search the web</p>
  <input type="text" placeholder="Search...">
</body>
</html>`;

function send(res, status, body, contentType = "application/json") {
  res.writeHead(status, { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" });
  res.end(contentType === "application/json" ? JSON.stringify(body) : body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  if (path === "/job-posting") {
    return send(res, 200, JOB_POSTING_HTML, "text/html");
  }

  if (path === "/not-a-job") {
    return send(res, 200, NOT_A_JOB_HTML, "text/html");
  }

  if (path === "/job-posting-no-ldjson") {
    return send(res, 200, JOB_POSTING_HTML.replace(/<script type="application\/ld\+json">.*?<\/script>/s, ""), "text/html");
  }

  if (path === "/api/health") {
    return send(res, 200, { success: true, data: { db: "connected" } });
  }

  if (path === "/api/jobs/count") {
    return send(res, 200, { success: true, data: { count: 3 } });
  }

  if (method === "POST" && path === "/api/auth/login") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      const { email, password } = JSON.parse(body || "{}");
      if (email === "test@jobpilot.app" && password === "TestPass123!") {
        return send(res, 200, {
          success: true,
          data: {
            user: {
              _id: "e2e-user-1",
              name: "Test User",
              email: "test@jobpilot.app",
              username: "testuser",
              settings: {},
              authProviders: { password: true, google: false },
            },
            accessToken: "e2e-access-token",
            refreshToken: "e2e-refresh-token",
          },
        });
      }
      return send(res, 401, { success: false, message: "Invalid email or password." });
    });
    return;
  }

  if (method === "POST" && path === "/api/auth/register") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      const { email } = JSON.parse(body || "{}");
      if (email === "existing@jobpilot.app") {
        return send(res, 409, { success: false, message: "Email already registered." });
      }
      return send(res, 201, {
        success: true,
        data: {
          user: { _id: "e2e-user-2", name: "New User", email, username: "newuser", settings: {}, authProviders: { password: true, google: false } },
          accessToken: "e2e-access-token",
          refreshToken: "e2e-refresh-token",
        },
      });
    });
    return;
  }

  if (path === "/api/jobs" && method === "GET") {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return send(res, 401, { success: false, message: "Unauthorized." });
    }
    return send(res, 200, {
      success: true,
      data: {
        jobs: [
          { _id: "job-1", title: "Frontend Engineer", company: "Google", status: "applied", salary: "", confidenceScore: 85, createdAt: new Date().toISOString() },
          { _id: "job-2", title: "Backend Engineer", company: "Meta", status: "saved", salary: "", confidenceScore: 70, createdAt: new Date().toISOString() },
          { _id: "job-3", title: "ML Engineer", company: "OpenAI", status: "interview", salary: "", confidenceScore: 92, createdAt: new Date().toISOString() },
        ],
        pagination: { page: 1, limit: 50, total: 3, pages: 1 },
      },
    });
  }

  return send(res, 404, { success: false, message: "Not found." });
});

server.listen(PORT, () => {
  console.log(`Fixture server running on http://127.0.0.1:${PORT}`);
});
