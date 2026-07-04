<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Frequently Asked Questions</h1>
  <p><em>Core insights regarding JobPilot's architecture, AI integrations, and deployment.</em></p>
</div>

---

## 📑 Table of Contents

1. [Platform & Vision](#-platform--vision)
2. [Infrastructure & Setup](#-infrastructure--setup)
3. [AI Orchestration](#-ai-orchestration)
4. [Extension Capabilities](#-extension-capabilities)
5. [Related Documentation](#-related-documentation)

---

## 🌍 Platform & Vision

### What exactly is JobPilot?
JobPilot operates as an enterprise-grade Career Operating System. It consists of a high-performance Next.js web application, a scalable Express REST API, and a Manifest V3 Chrome Extension. It is designed to automate the entire job search lifecycle—from scraping job boards to managing interviews and drafting AI-driven cover letters.

### Is JobPilot Open Source?
Yes. JobPilot is proudly open-source under the MIT license. You possess full autonomy to self-host the infrastructure or utilize our production deployment.

### How is state managed across the platform?
JobPilot utilizes a hybrid approach: **Redux Toolkit** handles global authentication states and user preferences on the client, while custom hooks utilizing **Axios and LRU Caches** manage server-state data to guarantee rapid, zero-latency interactions on the Kanban board.

---

## 🏗️ Infrastructure & Setup

### What are the core system requirements for self-hosting?
To deploy the JobPilot stack, you require:
- **Node.js:** v18.0 or higher (strict requirement for native ESM support).
- **Database:** A MongoDB Atlas Cluster (M0 Free Tier is sufficient for personal use).
- **Inference:** A Groq API Key for the AI engine.

### Which environment variables are strictly enforced?
The backend employs a fail-fast configuration. Without `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `GROQ_API_KEY`, the Node process will intentionally refuse to start. See the [Environment Documentation](./environment.md) for a full breakdown.

### How are Cron Reminders dispatched?
The backend hosts an autonomous `node-cron` worker that executes a synchronized sweep every 10 minutes. It claims pending reminders atomically from the database and dispatches them via a cached Nodemailer SMTP transporter.

---

## 🤖 AI Orchestration

### Which LLM powers the Career Brain?
JobPilot relies on Groq's high-speed inference engine, specifically defaulting to the `llama-3.3-70b-versatile` model. We chose Groq over traditional OpenAI wrappers due to its ultra-low latency, which is critical for real-time UI generation like Cover Letters and Interview Prep.

### What AI endpoints are currently supported?
The platform currently exposes 8 specialized models:
1. **Follow-Up Generator:** Drafts warm recruiter nudges.
2. **Interview Prep:** Anticipates technical and behavioral queries based on the JD.
3. **JD Summarization:** Distills dense requirements into rapid-read bullets.
4. **Cover Letter Drafter:** Merges your Resume JSON with the Job Context.
5. **Resume Tailor:** Outputs ATS-bypassing keyword suggestions.
6. **ATS Scoring:** Deterministic percentage-based compatibility matching.
7. **Role Recommendations:** Lateral career pivoting logic.
8. **Skill Gap Analysis:** Precise matrix of missing competencies.

### How is my data protected during AI inference?
JobPilot operates on a **stateless inference** model. No chat histories are preserved. We only transmit the specific context required (e.g., the parsed JSON of your resume and the target job description) securely to Groq for a single-shot generation.

---

## 🧩 Extension Capabilities

### Which job boards does the extension support natively?
The MV3 extension is built with 37 targeted host permissions, covering major aggregators like LinkedIn, Indeed, Glassdoor, and Wellfound, as well as ATS platforms like Greenhouse, Lever, Ashby, and Workday.

### What happens if I scrape an unsupported board?
The extension utilizes a cascading fallback engine. If it doesn't recognize the domain, it actively hunts for `LD+JSON` (Schema.org JobPosting) structures or standard `microdata` in the DOM, allowing it to scrape thousands of unsupported sites accurately.

### Does the extension function in Incognito Mode?
Yes, but with caveats. Chrome strictly limits `chrome.storage` inside private contexts. To prevent crashes, the extension gracefully degrades to an in-memory `Map` storage system. You will need to re-synchronize your auth token if the incognito window is fully closed.

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **Deployment Setup** | [Deployment Guide](./deployment.md) |
| **Diagnostic Runbooks** | [Troubleshooting Guide](./troubleshooting.md) |
| **Open Source Collaboration**| [Contributing Guide](./contributing-guide.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="./contributing-guide.md">Contributing Guide →</a>
</div>
