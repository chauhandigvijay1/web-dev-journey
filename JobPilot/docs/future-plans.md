<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Future Plans & Roadmap</h1>
  <p><em>The horizon for JobPilot: AI integration, enterprise scale, and beyond.</em></p>
</div>

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Currently In Progress](#-currently-in-progress)
3. [Short-Term Initiatives (Q3/Q4)](#-short-term-initiatives)
4. [Long-Term Vision (Enterprise)](#-long-term-vision)
5. [How to Contribute](#-how-to-contribute)
6. [Related Documentation](#-related-documentation)

---

## 🎯 Executive Summary

JobPilot is transitioning from a powerful personal productivity tool into a collaborative, multi-tenant ecosystem. Our roadmap is heavily driven by increasing the surface area of our AI capabilities, fortifying security structures, and providing absolute data portability for power users.

> [!TIP]
> **Open Source Vision:** We actively encourage community contributions. If a feature on this roadmap aligns with your expertise, consult the [Contributing Guide](./contributing-guide.md) to claim the issue!

---

## 🚧 Currently In Progress

Our core engineering focus is currently allocated to hardening the platform and expanding administrative visibility.

### 1. Advanced Security Hardening (CSRF)
While our dual-JWT implementation is highly robust, we are upgrading the authentication layer to include explicit **Synchronizer Tokens (CSRF protection)**. This guarantees that state-changing requests (like deleting a job pipeline) cannot be executed via malicious third-party cross-site requests.

### 2. Administrator Dashboard
We are constructing a secure `/admin` routing group. This module will allow platform maintainers to:
- Monitor global API rate-limit utilization.
- Track aggregated (anonymized) LLM token spend via Groq.
- Analyze infrastructure health and cron-job error rates.

### 3. Absolute Data Portability
Users own their data. We are finalizing a **Bulk Import/Export** pipeline that allows candidates to download their entire pipeline history, contacts, and AI-generated notes into standardized JSON and CSV formats.

---

## 🚀 Short-Term Initiatives (Q3/Q4)

Features planned for the immediate release cycles:

| Feature | Description | Impact |
|---------|-------------|--------|
| **IMAP Email Ingestion** | Allow JobPilot to read incoming interview invites via IMAP and automatically move Kanban cards to the "Interview" stage. | Eliminates manual pipeline updates for heavy users. |
| **Dynamic Extraction Engine** | Shift the Chrome Extension's scraping fallback selectors to a backend-hosted JSON file, allowing us to patch support for new job boards without requiring Web Store updates. | Zero-downtime updates for scraping targets. |
| **Mock Interview Bot** | Leverage Groq's low-latency inference to build an interactive, voice-based technical interviewer directly in the browser. | Game-changing interview preparation. |

---

## 🌍 Long-Term Vision (Enterprise)

The ultimate trajectory for JobPilot shifts towards organizational capabilities.

### Multi-Tenant Architecture
Expanding the database schema to support **Organizations**. This allows University Career Centers, Coding Bootcamps, and Placement Agencies to manage and monitor pipelines for hundreds of students simultaneously under a single billing umbrella.

### Microservice Isolation
As the user base scales, the monolithic Express core will be decomposed. High-CPU operations (like the AI Orchestrator) and high-I/O operations (like the Reminder Dispatcher) will be split into independent Docker containers communicating via gRPC or message brokers like RabbitMQ.

---

## 🤝 How to Contribute

We rely on the open-source community to accelerate this roadmap.

> [!IMPORTANT]
> **Testing Mandate:** If you are building a feature listed here, you must include comprehensive Unit (Vitest) and End-to-End (Playwright) tests. Any PR merging into `main` must maintain our 140+ test passing baseline.

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **Current Architecture** | [Architecture Details](./architecture.md) |
| **Technical Reflections** | [Lessons Learned](./lessons-learned.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="./lessons-learned.md">Lessons Learned →</a>
</div>
