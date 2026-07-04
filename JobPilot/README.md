<p align="center">
  <img src="./docs/assets/screenshots/logo.svg" alt="JobPilot" width="120" />
</p>

<p align="center">
  <strong>Your AI Career Operating System — Track every application, land every opportunity.</strong>
</p>

<p align="center">
  JobPilot replaces spreadsheets, sticky notes, and scattered browser tabs with a unified,
  AI-powered workspace to manage your entire job search from one place.
</p>

<br/>

<p align="center">
  <a href="https://jobpilot-client-chi.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/LIVE_DEMO-→_Web_App-18181b?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="./docs/index.md" target="_blank">
    <img src="https://img.shields.io/badge/DOCUMENTATION-→_Read_the_Docs-2563eb?style=for-the-badge&logo=gitbook&logoColor=white" alt="Documentation" />
  </a>
  <a href="https://github.com/chauhandigvijay1/web-dev-journey" target="_blank">
    <img src="https://img.shields.io/badge/SOURCE-→_GitHub-18181b?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://web-dev-journey-cnee.onrender.com/api/health" target="_blank">
    <img src="https://img.shields.io/badge/API-→_Health_Check-22c55e?style=for-the-badge&logo=render&logoColor=white" alt="API Health" />
  </a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Tests-162_passing-brightgreen?style=flat-square&logo=vitest" alt="Tests" />
  <img src="https://img.shields.io/badge/Version-1.0.2-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Framework-Next.js_14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/API-Express_5-green?style=flat-square&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/AI-Groq_Llama_3-orange?style=flat-square&logo=groq" alt="Groq" />
  <img src="https://img.shields.io/badge/Extension-Chrome_MV3-4285F4?style=flat-square&logo=google-chrome" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/SaaS_Readiness-8.2/10-blue?style=flat-square" alt="SaaS Readiness" />
</p>

<br/>

---

## 🎬 Motion Poster

<p align="center">
  <a href="https://jobpilot-client-chi.vercel.app" target="_blank">
    <img src="./docs/assets/gifs/demo-thumbnail.gif" alt="JobPilot Motion Video" width="350" style="border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
  </a>
  <br/>
  <em>Click above to watch the official JobPilot motion Poster.</em>
</p>

<br/>

<details>
<summary><strong>📑 Table of Contents</strong></summary>

- [Overview](#overview)
- [Feature Showcase (GIFs & UI)](#feature-showcase-gifs--ui)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Support](#support)

</details>

<br/>

---

## 🌍 Overview

### The Problem

Job seekers juggle spreadsheets, browser tabs, email drafts, and sticky notes to track applications. Follow-ups slip through the cracks. Cover letters are written from scratch every time. Resumes need manual tailoring per job. There is no single source of truth — and every missed follow-up is a missed opportunity.

### The Solution

**JobPilot** is a full-stack, AI-powered job application management platform that consolidates your entire job search into a unified workspace. It replaces chaos with structure: a Kanban pipeline visualizes your progress, AI generates cover letters and interview prep in seconds, a Chrome extension captures jobs from 50+ portals with one click, and smart reminders ensure you never miss a follow-up again.

<br/>

---

## 🌟 Feature Showcase (GIFs & UI)

Rather than scattering images, explore the core modules of JobPilot below. **Interactive Workflows** are captured as GIFs, while **Static Interfaces** are presented as high-resolution screenshots.

### 🔄 Interactive Workflows

<details open>
  <summary><strong>1. The Kanban Pipeline</strong></summary>
  <p><em>Drag jobs through Saved → Applied → OA → Interview → Offer. Filter, edit, and bulk-manage applications with instant state updates.</em></p>
  <p align="center">
    <img src="./docs/assets/gifs/kanban-workflow.gif" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Kanban Pipeline" />
  </p>
</details>

<details>
  <summary><strong>2. Edge Scraping (Chrome Extension)</strong></summary>
  <p><em>Save jobs from LinkedIn, Indeed, Naukri, Glassdoor, and 50+ other boards with one click using <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd>.</em></p>
  <p align="center">
    <img src="./docs/assets/gifs/extension-save.gif" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Edge Scraping" />
  </p>
</details>

<details>
  <summary><strong>3. AI-Powered Tools (Cover Letters,Interview Preparation & ATS)</strong></summary>
  <p><em>Generate personalized cover letters, interview questions, and ATS scores via Groq Llama 3 in real-time.</em></p>
  <p align="center">
    <img src="./docs/assets/gifs/ai-interview-question.gif" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="AI Streaming" />
  </p>
</details>

<details>
  <summary><strong>4. AI Career Brain (Resume Parsing)</strong></summary>
  <p><em>Upload your PDF resume once. The AI extracts skills, experience, and education to map against jobs.</em></p>
  <p align="center">
    <img src="./docs/assets/gifs/resume-upload.gif" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Resume Extraction" />
  </p>
</details>

<br/>

### 🖥️ Core Interfaces

<details open>
  <summary><strong>1. Analytics Dashboard</strong></summary>
  <p><em>Pipeline funnel views, status distribution, and weekly application trends to measure your momentum.</em></p>
  <p align="center">
    <img src="./docs/assets/screenshots/Analytics.png" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Analytics Dashboard" />
  </p>
</details>

<details>
  <summary><strong>2. Global Applications Dashboard</strong></summary>
  <p><em>The macro-level table view of your entire job search dataset.</em></p>
  <p align="center">
    <img src="./docs/assets/screenshots/Dashboard.png" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Global Dashboard" />
  </p>
</details>

<details>
  <summary><strong>3. Reminders Engine</strong></summary>
  <p><em>Automated follow-up emails with configurable timing and paginated batch processing.</em></p>
  <p align="center">
    <img src="./docs/assets/screenshots/Reminder.png" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Reminders Engine" />
  </p>
</details>

<details>
  <summary><strong>4. Profile, Settings, & Theming</strong></summary>
  <p><em>Fully customizable workspace featuring 7 distinct themes and 6 accent colors.</em></p>
  <p align="center">
    <img src="./docs/assets/screenshots/Profile%26Theme.png" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Settings and Themes" />
  </p>
</details>

<details>
  <summary><strong>5. Landing Page</strong></summary>
  <p><em>The authenticated entry point and value proposition.</em></p>
  <p align="center">
    <img src="./docs/assets/screenshots/LandingPage.png" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Landing Page" />
  </p>
</details>

<br/>

---

## 🏛️ Architecture

### System Overview

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Next.js 14 App<br/>Vercel (SSR + Static)"]
        Extension["Chrome MV3 Extension<br/>popup ↔ content ↔ background"]
    end

    subgraph API["API Layer"]
        Express["Express 5 Server<br/>Port 5051"]
        Auth["Auth Service<br/>JWT + bcrypt + Google OAuth"]
        JobSvc["Job Service<br/>CRUD + Extraction + SSRF Protection"]
        AISvc["AI Service<br/>Groq Llama 3 — 8 Endpoints"]
        ReminderSvc["Reminder Service<br/>node-cron + nodemailer (batched)"]
        CareerSvc["Career Brain<br/>Resume Parsing + ATS Scoring"]
    end

    subgraph Storage["Storage Layer"]
        MongoDB["MongoDB Atlas<br/>4 Collections, Compound Indexes"]
        Cloudinary["Cloudinary<br/>Resume PDFs + Profile Images"]
        Cache["In-Memory Cache<br/>SMTP Transporter + Token Map"]
    end

    subgraph External["External Services"]
        Groq["Groq API<br/>llama-3.3-70b-versatile"]
        Google["Google OAuth<br/>One Tap + Sign-In"]
        SMTP["SMTP Provider<br/>SendGrid / Gmail"]
    end

    Browser --> Express
    Extension --> Express
    Express --> Auth
    Express --> JobSvc
    Express --> AISvc
    Express --> ReminderSvc
    Express --> CareerSvc
    Auth --> MongoDB
    Auth --> Google
    JobSvc --> MongoDB
    AISvc --> Groq
    ReminderSvc --> SMTP
    ReminderSvc --> MongoDB
    CareerSvc --> Cloudinary
    CareerSvc --> MongoDB
    Express --> Cache

    style Client fill:#e1f5fe,stroke:#0288d1,color:#01579b
    style API fill:#e8f5e9,stroke:#388e3c,color:#1b5e20
    style Storage fill:#fff3e0,stroke:#f57c00,color:#e65100
    style External fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c
```

### Extension Auth Flow

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js Web App
    participant Ext as Chrome Extension
    participant API as Express API

    User->>Web: Log in
    Web->>Web: Store JWT in localStorage
    Note over Ext: Content script reads token
    Ext->>Ext: Dispatch SYNC_AUTH_TOKEN to background
    Ext->>API: POST /api/jobs (Bearer)
    API->>API: Verify JWT + tokenVersion
    API-->>Ext: 200 / 401

    alt 401 Unauthorized
        Ext->>Ext: Remove stale token
        Ext->>Web: Request re-sync from open tab
        Web-->>Ext: Fresh token
        Ext->>API: Retry with new token
    end
```

<br/>

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS 3, shadcn/ui, Redux Toolkit, `@dnd-kit`, Lucide Icons | UI rendering, state management, drag-and-drop Kanban |
| **Backend** | Node.js, Express 5, Mongoose 8, JWT + `bcrypt` | REST API, authentication, business logic |
| **Database** | MongoDB Atlas (4 collections, compound indexes, paginated queries) | Persistent storage |
| **AI** | Groq API — Llama 3.3 70B (8 endpoints) | Cover letters, interview prep, ATS scoring, skill gaps, resume parsing |
| **Extension** | Chrome MV3 — Scripting API, Storage API, AbortController + exponential backoff | One-click job saving from 50+ boards |
| **Files** | Multer (memory storage) → Cloudinary (raw + image), pdf-parse + mammoth | Resume and profile image uploads |
| **Email** | `nodemailer` (cached SMTP), `node-cron` (paginated batch reminders) | Automated follow-ups and notifications |
| **Auth** | Dual JWT (access 15m + refresh 30d httpOnly), Google OAuth, `bcrypt` (cost 12), `tokenVersion` invalidation | Secure authentication |
| **Security** | `helmet`, `cors`, `hpp`, `express-rate-limit` (3 tiers), SSRF IP blocklist, input sanitization | OWASP Top 10 protection |
| **Testing** | Vitest, Supertest, `@testing-library/react`, Playwright (E2E) | 162 tests across all layers |
| **Deployment** | Vercel (frontend), Render (backend) | CI/CD with environment variable injection |

<br/>

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works) or local MongoDB
- [Groq API key](https://console.groq.com) (free tier — sufficient for development)
- [Git](https://git-scm.com)

### 1. Clone the Repository

```bash
git clone https://github.com/chauhandigvijay1/web-dev-journey.git
cd web-dev-journey/JobPilot
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```

### 4. Run Locally

Run the backend and frontend concurrently in separate terminal instances:

```bash
# Terminal 1 (Backend - Port 5051)
cd backend && npm run dev

# Terminal 2 (Frontend - Port 3000)
cd frontend && npm run dev
```

### 5. Chrome Extension (Development)

1. Open `chrome://extensions` in your browser.
2. Enable **Developer mode** (toggle top-right).
3. Click **Load unpacked**.
4. Select the `extension/` folder from this repository.
5. Pin JobPilot to the toolbar. Press <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd> to open the popup from any tab.

### 6. Verify Tests

```bash
# Backend tests (21 passing)
cd backend && npm test

# Frontend unit + component tests (125 passing)
cd frontend && npm test

# End-to-end tests (16 passing) — requires both servers running
cd frontend && npx playwright test
```

<br/>

---

## 🔐 Environment Variables

> **Note:** Never commit your `.env` files. Below are the required configurations; refer to the [Environment Documentation](./docs/environment.md) for the full list of 37 optional parameters.

### Backend (`backend/.env`)

| Variable | Status | Description | Example Placeholder |
|----------|--------|-------------|---------------------|
| `MONGO_URI` | **Required** | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/test` |
| `JWT_SECRET` | **Required** | Access token secret (≥32 chars) | `your_secure_32_character_secret_string` |
| `JWT_REFRESH_SECRET`| **Required** | Refresh token secret (≥32 chars) | `another_secure_32_character_secret` |
| `GROQ_API_KEY` | **Required** | Groq API key for AI features | `gsk_your_api_key_here` |
| `PORT` | Optional | HTTP listen port | `5051` |

### Frontend (`frontend/.env.local`)

| Variable | Status | Description | Example Placeholder |
|----------|--------|-------------|---------------------|
| `NEXT_PUBLIC_API_URL`| **Required** | Backend API base URL | `http://localhost:5051/api` |

<br/>

---

## 📡 API Reference

All API routes are mounted under `/api` on the Express backend. Authentication is handled via the `Authorization: Bearer <token>` header. For exhaustive schemas, refer to the [API Documentation](./docs/api.md).

| Domain | Route | Method | Rate Limited | Description |
|--------|-------|--------|--------------|-------------|
| **Auth** | `/api/auth/login` | `POST` | Yes (12/10m) | Authenticate user & issue dual JWT |
| **Auth** | `/api/auth/refresh` | `POST` | No | Refresh token pair via Cookie |
| **Jobs** | `/api/jobs/extract` | `POST` | No | Extract data from URL (SSRF protected) |
| **AI** | `/api/ai/cover-letter` | `POST` | Yes (20/15m) | Generate personalized cover letter |
| **Brain**| `/api/career-brain/resume`| `POST` | No | Upload and parse PDF resume |
| **Cron** | `/api/system/reminders/sweep`| `POST` | No | Trigger manual SMTP digest (Secret Header) |

<br/>

---

## 🗄️ Database Schema

JobPilot relies on **MongoDB Atlas** running 4 highly-indexed collections. For exact indexing logic, see the [Database Docs](./docs/database.md).

1. **`users`**: Core identity, `bcrypt` password hashes, and `tokenVersion` security integers.
2. **`jobs`**: Polymorphic schema covering 50+ board variations, arrays of required skills, embedded contacts, and Kanban status enums.
3. **`resumeprofiles`**: Extracted JSON blobs covering Education, Projects, and Certifications, mapped to Cloudinary CDN URLs.
4. **`reminderqueues`**: High-throughput cron state tracking with exponential backoff timers.

<br/>

---

## 🧪 Testing

A strict 162-Test Quality Assurance Matrix guards JobPilot against regressions.

| Layer | Tool | Count | Coverage Focus |
|-------|------|-------|----------------|
| **Backend Unit** | Vitest + Supertest | 21 | Auth pipelines, job extraction logic, SMTP sweeps. |
| **Frontend Unit** | Vitest + RTL | 125 | React components, Kanban drag-and-drop state, Redux slices. |
| **End-to-End** | Playwright | 16 | Browser extension interactions, OAuth, full pipeline flows. |
| **Total** | — | **162** | **100% Passing ✓** |

<br/>

---

## 🚀 Deployment

- **Next.js Frontend**: Deployed seamlessly on **Vercel** via automatic Git push triggers.
- **Express Backend**: Deployed as a Dockerized Node.js Web Service on **Render**.
- **MV3 Extension**: Uploaded manually to the **Chrome Web Store** Dashboard.

*(Step-by-step instructions available in the [Deployment Guide](./docs/deployment.md))*

<br/>

---

## 🛡️ Security

Security is foundational. JobPilot enforces a Zero-Trust architecture.

- **Dual JWTs & Revocation**: Short-lived Access Tokens (15m) and `HttpOnly` Refresh Cookies. Modifying a password instantly increments a `tokenVersion` integer, terminating all outstanding sessions globally without Redis blocklists.
- **SSRF Defenses**: The URL Extractor utilizes Node's `net.isIP()` to actively reject attempts to scan local AWS VPC IP ranges (e.g., `10.x.x.x`).
- **DDoS Mitigation**: 3-tiered independent rate limiting separating Auth endpoints from expensive Groq AI Inference routes.
- **Data Sanitization**: Mongoose guarantees parameterized queries, while Express middleware actively strips `$`, `.`, and `__proto__` characters to prevent NoSQL injection and Prototype Pollution.

<br/>

---

## ⚡ Performance

- **O(N) Database Reduction**: Username generation utilizes an optimized `$regex` match to reduce potential database queries from 10,000 down to exactly 2.
- **Caching**: SMTP transporters are cached in-memory using Singleton pooling to prevent TLS handshake overhead. The frontend uses a strict 50-item LRU cache for heavy React Data hooks.
- **Optimized Scraping**: The MV3 Extension relies fundamentally on `LD+JSON` schemas instead of brittle CSS DOM selectors, guaranteeing instant and accurate data extraction.

<br/>

---

## 🛣️ Roadmap

### Implemented ✓
- [x] Drag-and-drop Kanban Pipeline.
- [x] 8 Distinct Groq AI Integrations (Cover Letters, ATS Scoring).
- [x] Chrome MV3 Extension targeting 50+ portals.
- [x] Dual-Token Authentication + Google OAuth.
- [x] Paginated `node-cron` Reminders via SMTP.
- [x] Comprehensive 162-Test Matrix.

### Planned ⏳
- [ ] Transitioning to Double-Submit CSRF tokens.
- [ ] Integrating exponential backoff for Auth brute-force lockouts.
- [ ] Admin Dashboard for analytics oversight.
- [ ] React Native Mobile Wrapper.

<br/>

---

## ⚠️ Known Limitations

- AI capabilities rely strictly on Groq API uptime.
- The Job Extractor operates best on job boards providing `LD+JSON` `@graph` schemas. Non-compliant bespoke job boards may require manual data adjustments.
- The Chrome Extension requires a Desktop Browser and is not available natively on mobile Chrome.

<br/>

---

## 🤝 Contributing

We welcome world-class engineers to the project! Please review our comprehensive [Contributing Guidelines](./CONTRIBUTING.md) to understand our Conventional Commits workflow, PR testing matrix requirements, and our Code of Conduct.

<br/>

---

## 📄 License

JobPilot is open-source software licensed under the **[MIT License](./LICENSE)**.

---

## 🧑‍💻 Author

**Digvijay Kumar Singh**  
*Creator, Lead Architect, and Maintainer*  
- 🐙 [GitHub Profile](https://github.com/chauhandigvijay1)

---

## 📞 Support

If you encounter a replicable runtime error, please review the [Troubleshooting Guide](./docs/troubleshooting.md) or open an issue on our [GitHub Tracker](https://github.com/chauhandigvijay1/web-dev-journey/issues).

<div align="center">
  <em>Thank you for exploring JobPilot. If you find this project valuable, please consider giving it a ⭐ on GitHub!</em>
</div>
