# JobPilot Architecture

JobPilot is a full-stack AI-powered job application tracker consisting of a Next.js 14 frontend, an Express 5 REST API, a Chrome MV3 extension, and a Groq-powered AI layer. Data flows from the browser extension or web UI through the API to MongoDB Atlas, with node-cron driving automated email reminders. The system is deployed across Vercel (frontend), Render (backend), and MongoDB Atlas (database).

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                    │
│                                                                          │
│  ┌──────────────────────┐    ┌───────────────────────────────────────┐   │
│  │  Chrome Extension     │    │  Browser (Web App)                   │   │
│  │  (MV3)                │    │                                       │   │
│  │                       │    │  ┌─────────────────────────────────┐  │   │
│  │  ┌───────────────┐   │    │  │  Next.js 14 (App Router)        │  │   │
│  │  │ Popup (HTML)  │   │    │  │  ┌─────────┐ ┌───────────────┐  │  │   │
│  │  │ popup.js      │───┼────┼──│  │  Pages  │ │ Redux Store   │  │  │   │
│  │  └──────┬────────┘   │    │  │  │         │ │ (auth slice)  │  │  │   │
│  │         │            │    │  │  └─────────┘ └───────┬───────┘  │  │   │
│  │  ┌───────┴──────────┐ │    │  │       ┌──────────────┘         │  │   │
│  │  │ Background (SW)  │ │    │  │  ┌────┴──────┐                 │  │   │
│  │  │ chrome.storage   │ │    │  │  │ Axios API │                 │  │   │
│  │  │ fetchWithRetry   │─┼────┼──│  │ Client    │                 │  │   │
│  │  └───────┬──────────┘ │    │  │  └───────────┘                 │  │   │
│  │          │            │    │  └─────────────────────────────────┘  │   │
│  │  ┌───────┴──────────┐ │    │                                       │   │
│  │  │ Content Script   │ │    │  localStorage ←─────── JWT token     │   │
│  │  │ document.clone   │ │    │                                       │   │
│  │  │ LD+JSON / micro  │ │    └───────────────────────────────────────┘   │
│  │  │ board selectors  │ │                                               │
│  │  └──────────────────┘ │                                               │
│  └────────────────────────┘                                              │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ HTTPS / CORS
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                                     │
│                                                                          │
│  Express 5 on Render (port 5051)                                        │
│                                                                          │
│  ┌────────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────────┐   │
│  │ helmet     │  │compression│  │    hpp    │  │ cookie-parser      │   │
│  │ (security) │  │ (gzip)    │  │  (param   │  │ (refresh token)    │   │
│  │            │  │           │  │  coll)    │  │                    │   │
│  └────────────┘  └──────────┘  └───────────┘  └────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Rate Limiters       │  ┌────────────┐  ┌──────────────┐        │   │
│  │  API: 250/15min      │  │ CORS       │  │ sanitizeReq  │        │   │
│  │  Auth: 12/10min      │  │ (whitelist)│  │ ($, proto)   │        │   │
│  │  AI: 20/15min        │  └────────────┘  └──────────────┘        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  /api Router                                                      │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐  │   │
│  │  │auth  │ │jobs  │ │ ai   │ │upload│ │career│ │system│ │health│  │   │
│  │  │      │ │      │ │      │ │      │ │brain │ │      │ │      │  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Services & Data Layer                                 │
│                                                                          │
│  ┌──────────────────────┐    ┌──────────────────────────────────────┐   │
│  │  MongoDB Atlas        │    │  External Services                  │   │
│  │  (Mongoose 8 ODM)     │    │                                      │   │
│  │                       │    │  ┌──────────────────────────────┐   │   │
│  │  ┌─────────────────┐  │    │  │  Groq API (Llama 3)          │   │   │
│  │  │ User collection  │  │    │  │  - Cover letters            │   │   │
│  │  │ (auth, settings) │  │    │  │  - Interview prep           │   │   │
│  │  └─────────────────┘  │    │  │  - Resume tailoring          │   │   │
│  │                       │    │  │  - Job summaries             │   │   │
│  │  ┌─────────────────┐  │    │  │  - Follow-up emails          │   │   │
│  │  │ Job collection   │  │    │  └──────────────────────────────┘   │   │
│  │  │ (applications)   │  │    │                                      │   │
│  │  └─────────────────┘  │    │  ┌──────────────────────────────┐   │   │
│  │                       │    │  │  Cloudinary (file uploads)    │   │   │
│  │  ┌─────────────────┐  │    │  └──────────────────────────────┘   │   │
│  │  │ ReminderQueue    │  │    │                                      │   │
│  │  │ (cron jobs)      │  │    │  ┌──────────────────────────────┐   │   │
│  │  └─────────────────┘  │    │  │  SMTP (nodemailer)            │   │   │
│  │                       │    │  │  - Follow-up reminders        │   │   │
│  │  ┌─────────────────┐  │    │  │  - Deadline alerts           │   │   │
│  │  │ ResumeProfile   │  │    │  │  - Weekly summaries           │   │   │
│  │  │ (parsed resumes) │  │    │  └──────────────────────────────┘   │   │
│  │  └─────────────────┘  │    │                                      │   │
│  └──────────────────────┘    └──────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  node-cron (every 10 min)                                        │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │ runReminderSweep() → claim → process → sendMail → mark    │  │   │
│  │  │ Paginated batch (env.reminderBatchSize), exponential retry │  │   │
│  │  │ Stale lock recovery (env.reminderLockMinutes)              │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer                  | Technology                                                  |
|------------------------|-------------------------------------------------------------|
| Frontend Framework     | Next.js 14 (App Router), React 18, TypeScript 5             |
| UI Components          | shadcn/ui (Radix primitives), TailwindCSS 3, class-variance-authority |
| State Management       | Redux Toolkit 2, React Redux 9                              |
| HTTP Client            | Axios 1 (interceptors, automatic 401 refresh)               |
| Backend Framework      | Express 5.2, Node.js ≥18                                    |
| Database ODM           | Mongoose 8.23, MongoDB Atlas                                |
| Authentication         | JWT (jsonwebtoken 9), bcrypt 6, Google OAuth (google-auth-library) |
| AI Layer               | Groq API (Llama 3 70B / Mixtral 8x7B)                      |
| Email                  | nodemailer 8, node-cron 4 (every 10 min)                    |
| File Uploads           | Multer 2 (memory storage), Cloudinary 2                     |
| Security               | helmet 8, compression, hpp, express-rate-limit 8           |
| URL Extraction         | Puppeteer, Cheerio, TinyFish API                            |
| Document Parsing       | pdf-parse, mammoth, pdf2json, word-extractor               |
| Extension              | Chrome MV3, Scripting API, Storage API                      |
| Testing (BE)           | Vitest 4, Supertest 7, mongodb-memory-server                |
| Testing (FE)           | Vitest 4, @testing-library/react 16, jsdom                  |
| End-to-End Testing     | Playwright 1.59                                             |
| CI / CD                | Vercel (frontend), Render (backend)                         |
| Ports                  | Backend: 5051, Frontend: 3000, Fixture (e2e): 4010          |

## Directory Structure

```
JobPilot/
├── backend/                          # Express 5 REST API
│   ├── src/
│   │   ├── app.js                    # Express app setup, CORS, middleware chain
│   │   ├── server.js                 # Entry point, DB connect, cron bootstrap
│   │   ├── config/
│   │   │   ├── env.js                # Environment variable loader + validation
│   │   │   ├── database.js           # MongoDB connection helper
│   │   │   └── cloudinary.js         # Cloudinary SDK config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Register, login, Google OAuth, refresh, logout, profile
│   │   │   ├── job.controller.js     # CRUD, extract from URL, count
│   │   │   ├── ai.controller.js      # Groq-powered: cover letter, interview, summary, etc.
│   │   │   ├── upload.controller.js  # Resume + profile image upload to Cloudinary
│   │   │   ├── health.controller.js  # Health check with DB state
│   │   │   ├── career-brain.controller.js  # Resume profile management
│   │   │   └── system.controller.js  # Manual reminder sweep, mail outbox
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # JWT Bearer verification + tokenVersion check
│   │   │   ├── security.middleware.js # Rate limiters, input sanitizer
│   │   │   ├── upload.middleware.js   # Multer config (resume 10MB, image 5MB)
│   │   │   └── system.middleware.js   # Shared secret for system routes
│   │   ├── models/
│   │   │   ├── User.js               # User schema (auth, settings, notifications)
│   │   │   ├── Job.js                # Job schema (status, contacts, skills, reminders)
│   │   │   ├── ReminderQueue.js      # Reminder queue schema
│   │   │   └── ResumeProfile.js      # Parsed resume data schema
│   │   ├── routes/
│   │   │   ├── index.js              # Route aggregator (/api)
│   │   │   ├── auth.routes.js        # 8 auth endpoints
│   │   │   ├── job.routes.js         # 9 job endpoints
│   │   │   ├── ai.routes.js          # 5 AI endpoints
│   │   │   ├── upload.routes.js      # 2 upload endpoints
│   │   │   ├── career-brain.routes.js # 3 career brain endpoints
│   │   │   ├── system.routes.js      # 2 system endpoints
│   │   │   └── health.routes.js      # 1 health endpoint
│   │   ├── services/
│   │   │   ├── auth.service.js       # Token generation, session management, settings
│   │   │   ├── job.service.js        # Job CRUD business logic
│   │   │   ├── reminder.service.js   # Cron sweep, dedup, email builder, retry logic
│   │   │   ├── mail.service.js       # Nodemailer transport
│   │   │   ├── email-templates.service.js  # HTML templates for reminders
│   │   │   └── job-extraction/       # URL-based job extraction (Puppeteer/Cheerio)
│   │   └── utils/
│   │       ├── jwt.js                # Sign/verify access + refresh tokens, hash, cookie opts
│   │       ├── groq.js               # Groq API client
│   │       ├── auth.js               # Username generation, email validation, normalization
│   │       ├── cloudinaryUpload.js   # Cloudinary upload helpers
│   │       ├── followUpDate.js       # Date formatting helpers
│   │       ├── logger.js             # Structured logging with request IDs
│   │       └── asyncHandler.js       # Express async error wrapper
│   └── tests/
│       ├── setup.js
│       ├── integration/
│       │   └── api.test.js
│       └── unit/
│           ├── auth.service.test.js
│           ├── reminder.service.test.js
│           ├── job-extraction.test.js
│           └── email-templates.test.js
├── frontend/                          # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (Inter font, ThemeProvider)
│   │   ├── providers.tsx              # Redux Provider + ThemeProvider
│   │   ├── page.tsx                   # Landing page
│   │   ├── login/page.tsx             # Login page
│   │   ├── signup/page.tsx            # Registration page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx             # Dashboard shell (sidebar, header)
│   │   │   ├── page.tsx               # Dashboard home (stats, recent jobs)
│   │   │   ├── dashboard-home.tsx     # Home content
│   │   │   ├── add-job/page.tsx       # Add job form
│   │   │   ├── analytics/page.tsx     # Analytics (funnel, trends, status dist)
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx           # Kanban board
│   │   │   │   └── [id]/page.tsx      # Job detail view
│   │   │   ├── reminders/page.tsx     # Reminders list
│   │   │   └── settings/page.tsx      # User settings
│   │   ├── error.tsx                  # Global error boundary
│   │   └── loading.tsx                # Global loading
│   ├── middleware.ts                  # Route protection (/dashboard, /profile, /settings)
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives (button, dialog, card, etc.)
│   │   ├── auth/                      # Auth shell, Google button, password field
│   │   ├── job/                       # JobCard, Kanban, FilterBar, JobDetailView, dialogs
│   │   ├── dashboard/                 # Dashboard shell, ReminderBell
│   │   ├── analytics/                 # Monthly trend chart component
│   │   └── theme/                     # Theme provider
│   ├── lib/                           # Utilities (utils, auth storage, theme, types, etc.)
│   ├── hooks/                         # Custom hooks (useJobs)
│   ├── store/                         # Redux store + auth slice
│   └── tests/
│       ├── setup.ts
│       ├── unit/                      # 107 pure function tests
│       ├── components/                # 18 component tests
│       └── e2e/                       # 16 Playwright tests
├── extension/                         # Chrome MV3 Extension
│   ├── manifest.json                  # MV3 manifest (50+ host permissions)
│   ├── content.js                     # Job scraper (LD+JSON, microdata, board-specific, generic)
│   ├── background.js                  # Service worker (auth sync, API proxy, 401 retry)
│   ├── popup.html                     # Popup UI
│   ├── popup.js                       # Popup logic (auth check, parse, save)
│   └── icons/                         # Extension icons
└── docs/
    ├── ARCHITECTURE.md
    └── API.md
```

## Data Flows

### Authentication Flow

```
┌──────────┐         ┌──────────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Frontend    │         │  API     │         │ MongoDB  │
│          │         │  (Next.js)   │         │(Express) │         │          │
└────┬─────┘         └──────┬───────┘         └────┬─────┘         └────┬─────┘
     │                      │                      │                    │
     │  POST /api/auth/     │                      │                    │
     │  (login/register)    │─────────────────────►│                    │
     │                      │                      │                    │
     │                      │                      │  Find/Create User  │
     │                      │                      │───────────────────►│
     │                      │                      │◄───────────────────│
     │                      │                      │                    │
     │                      │                      │  generateAccessToken()  (7d)
     │                      │                      │  generateRefreshToken() (30d)
     │                      │                      │  hashToken(refresh) → store
     │                      │                      │  createAuthSession()
     │                      │                      │                    │
     │  200 { token, user } │◄─────────────────────│                    │
     │  Set-Cookie:         │                      │                    │
     │  jobpilot_refresh    │                      │                    │
     │  (httpOnly, secure)  │                      │                    │
     │                      │                      │                    │
     │  Store token in      │                      │                    │
     │  localStorage        │                      │                    │
     │                      │                      │                    │
     │  All subsequent API  │                      │                    │
     │  calls:              │                      │                    │
     │  Authorization:      │─────────────────────►│                    │
     │  Bearer <access>     │                      │ verifyAccessToken()│
     │                      │                      │ check tokenVersion │
     │                      │                      │ find User          │
     │                      │◄─────────────────────│ req.user = user    │
     │                      │                      │                    │
     │  On 401:             │                      │                    │
     │  POST /api/auth/     │─────────────────────►│                    │
     │  /refresh (cookie)   │                      │ readRefreshToken() │
     │                      │                      │ verifyRefreshToken()│
     │                      │                      │ hash match check   │
     │                      │                      │ sessionId check    │
     │                      │                      │ tokenVersion check │
     │  { token, user }     │◄─────────────────────│ rotation → new pair│
     │  Set-Cookie: new     │                      │                    │
     │                      │                      │                    │
     │  Retry original      │                      │                    │
     │  request with new    │─────────────────────►│                    │
     │  Bearer token        │                      │                    │
```

### Job Save Flow (Extension)

```
┌────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────┐
│  Popup     │    │  Content     │    │  Background  │    │  API      │    │ MongoDB  │
│  (popup.js)│    │  Script      │    │  Service     │    │  (Express)│    │          │
│            │    │  (content.js)│    │  Worker      │    │           │    │          │
└─────┬──────┘    └──────┬───────┘    └──────┬───────┘    └─────┬─────┘    └────┬─────┘
      │                  │                   │                  │               │
      │ open popup       │                   │                  │               │
      │─────────────────►│                   │                  │               │
      │  GET_STATUS      │                   │                  │               │
      │─────────────────────────────────────►│                  │               │
      │  { authenticated, jobCount }         │                  │               │
      │◄─────────────────────────────────────│                  │               │
      │                  │                   │                  │               │
      │  PARSE_JOB       │                   │                  │               │
      │─────────────────►│                   │                  │               │
      │                  │ document.cloneNode(true)             │               │
      │                  │ try LD+JSON → @graph → JobPosting    │               │
      │                  │ try Microdata → itemtype JobPosting  │               │
      │                  │ try board-specific (LinkedIn,Indeed…)│               │
      │                  │ try generic fallback (50+ selectors) │               │
      │                  │ extract skills from description      │               │
      │◄─────────────────│ { title, company, location, … }     │               │
      │                  │                   │                  │               │
      │  SAVE_JOB (payload)                  │                  │               │
      │─────────────────────────────────────►│                  │               │
      │                   │                  │ normalize payload│               │
      │                   │                  │ check duplicate? │               │
      │                   │                  │  GET /api/jobs?  │               │
      │                   │                  │  originalApply…  │──────────────►│
      │                   │                  │◄─────────────────│               │
      │                   │                  │                  │               │
      │                   │                  │ POST /api/jobs   │               │
      │                   │                  │ (Bearer token)   │──────────────►│
      │                   │                  │                  │  Job.create() │
      │                   │                  │◄─────────────────│  syncReminders│
      │◄─────────────────────────────────────│ { success, job } │               │
      │ show saved-state  │                  │                  │               │
```

### Extension Scraping Flow

```
Page Load
    │
    ▼
document.cloneNode(true)  ← detached DOM (no layout thrash)
    │
    ├── 1. LD+JSON extractor
    │      └── Iterate <script type="application/ld+json">
    │            └── Parse JSON, traverse @graph array
    │                  └── Match @type containing "JobPosting"
    │                        └── Extract: title, company (hiringOrganization),
    │                            location (jobLocation→address), salary (baseSalary),
    │                            jobType (employmentType), skills, workMode
    │
    ├── 2. Microdata extractor
    │      └── Query [itemtype*="JobPosting"]
    │            └── Extract via [itemprop] selectors
    │
    ├── 3. Board-specific extractors (on hostname match)
    │      ├── LinkedIn    → .job-details-jobs-unified-top-card__*
    │      ├── Indeed      → .jobsearch-JobInfoHeader-*
    │      ├── Glassdoor   → .job-header-title, .job-header-company
    │      ├── Naukri      → .jd-header-title, .jd-header-company
    │      └── Monster     → .job-title, [class*="company"]
    │
    └── 4. Generic fallback (50+ CSS selectors)
           ├── Title: h1, [class*="job-title"], [itemprop="title"], og:title, URL parse
           ├── Company: [class*="company"], [itemprop="hiringOrganization"]
           ├── Location: [class*="location"], [itemprop="jobLocation"]
           ├── Salary: [class*="salary"], [itemprop="baseSalary"]
           ├── Description: [itemprop="description"], [class*="description"], article, main
           ├── Skills: Common skill keyword matching against description
           ├── Work mode: Keyword detection (remote/hybrid/on-site)
           └── Apply link: [data-automation*="apply"], [href*="apply"]
    │
    ▼
Dispatch event: 'jobpilot:scrape-complete' with extracted data
```

## Key Design Decisions

**1. Dual JWT Strategy (Access + Refresh Tokens)**
Access tokens live 7 days, refresh tokens 30 days. Refresh tokens are stored as a SHA-256 hash in the database with a rotating session ID. A `tokenVersion` counter on the user document allows instant invalidation of all sessions (e.g., on password change). The frontend Axios interceptor automatically catches 401 responses and attempts a transparent refresh before retrying the original request (deduplicated via a promise singleton).

**2. Server-Side Session Invalidation**
Rather than maintaining a blocklist of revoked tokens, every authenticated request verifies that the token's embedded `tokenVersion` matches the user's current `tokenVersion`. Bumping `tokenVersion` on password change immediately invalidates all outstanding sessions without requiring a database write on every request.

**3. Input Sanitization as Middleware**
All request bodies and query parameters pass through `sanitizeRequest()` before reaching route handlers. The sanitizer strips keys starting with `$` or `.`, and removes `__proto__`, `constructor`, and `prototype` to prevent prototype pollution and MongoDB operator injection.

**4. SSRF Protection on URL Extraction**
The job extraction endpoint validates URLs against a private IP blocklist and resolves the hostname before fetching. This prevents internal network probing through the Puppeteer-based extraction service.

**5. Fork-Join Extraction Pipeline (Extension)**
The content script uses a fork-join approach: it tries four independent extractors in order (LD+JSON, microdata, board-specific, generic), stopping at the first success. LD+JSON is preferred because it contains structured data; board-specific selectors handle the 50+ supported domains; the generic fallback uses a broad set of 50+ CSS selectors. The entire extraction happens on a cloned DOM to avoid layout thrashing.

**6. Reminder Queue with Stale Lock Recovery**
Reminders are not sent synchronously on job creation. Instead, a `ReminderQueue` collection tracks pending reminders, and a `node-cron` job (every 10 minutes) sweeps the queue. Each reminder has a lock with configurable staleness threshold, exponential backoff for retries (base 10 min, 2^n), and a max attempt limit. This ensures resilience against transient SMTP failures.

**7. CORS Whitelist with Extension Support**
The CORS middleware allows `chrome-extension://` origins dynamically without requiring them in the whitelist, plus loopback origins for local development. All other origins must be explicitly configured, and `null` origins (from file:// or postman) are rejected.

**8. Stateless Pagination with Hard Ceiling**
Job listings use cursor-less offset pagination (`?page=1&limit=50`) with a maximum limit of 200. Default is 50 per page. The response includes a `pagination` object with `page`, `limit`, `total`, and `pages`.

## Component Descriptions

### Frontend App (Next.js 14, TypeScript)

- **Pages**: 12 routes including landing, auth (login/signup), dashboard home, add-job, analytics, jobs list/kanban, job detail, reminders, settings, and 404.
- **Middleware**: Middleware at `frontend/middleware.ts` guards `/dashboard`, `/profile`, and `/settings` — redirects to `/login` with redirect query param if no refresh cookie is present. Also reverse-redirects authenticated users away from `/login` and `/register` to `/dashboard`.
- **State**: Redux Toolkit store with a single `auth` slice that manages user, token, and authentication state. Hydrated from `localStorage` on app load.
- **API Client**: Axios instance with base URL resolution (dev: `localhost:5051`, prod: Render URL), automatic Bearer token injection via request interceptor, and transparent 401 refresh via response interceptor.
- **UI**: shadcn/ui components (Dialog, DropdownMenu, Card, Button, Badge, etc.) with TailwindCSS theming. Dark/light mode via a theme provider that injects an inline script to prevent flash.
- **Kanban**: Drag-and-drop job status updates using `@dnd-kit/core`. Jobs are organized into 6 columns: Saved, Applied, Online Assessment, Interview, Offer, Rejected.
- **Analytics**: Pipeline funnel visualization, weekly/monthly trends, status distribution chart, and a follow-up queue view.

### Backend API (Express 5, Mongoose)

- **Models**: `User` (auth, settings, token version), `Job` (full application record with contacts, skills, reminders metadata), `ReminderQueue` (cron job queue with deduplication), `ResumeProfile` (AI-parsed resume data).
- **Controllers**: 7 controllers handling auth logic (register, login, Google OAuth, refresh, logout, profile management), job CRUD, AI generation (5 Groq-powered endpoints), file uploads (resume + profile image), health checks, career brain, and system operations.
- **Middleware Pipeline**: requestId → compression → hpp → cors → helmet → apiRateLimiter → cookieParser → json/urlencoded → sanitizeRequest → routes. Auth-protected routes additionally run the `protect` middleware (JWT verification + tokenVersion check).
- **Security**: Helmet sets HSTS (2 years with preload), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin. Request body size limited to 2MB.
- **Reminders**: node-cron scheduled at `*/10 * * * *` (every 10 minutes). Sweep processes reminders in paginated batches. Supports follow-up, interview, deadline, and weekly summary email types. SMTP via nodemailer.

### Chrome Extension (MV3)

- **Manifest**: Declares `activeTab`, `storage`, and `scripting` permissions. Host permissions cover 50+ job board domains plus the JobPilot frontend and API.
- **Content Script**: Injected on all supported domains. On page load, it clones the DOM and runs a 4-stage extraction pipeline (LD+JSON → microdata → board-specific → generic fallback). Dispatches a `jobpilot:scrape-complete` custom event for any consumer. On JobPilot app pages, it syncs the auth token from `localStorage` to `chrome.storage.local` via the background service worker.
- **Background Service Worker**: Manages auth token state with `chrome.storage.local` and in-memory fallback. Handles `SYNC_AUTH_TOKEN`, `SAVE_JOB`, and `GET_STATUS` messages. The `SAVE_JOB` handler normalizes the scraped payload, checks for duplicates by `originalApplyLink`, and POSTs to the API with exponential backoff (3 retries, 10s timeout). On 401, it clears the token and requests re-sync from any open JobPilot tab.
- **Popup**: Shows connection status (authenticated + job count), parses the current tab for job data, displays detected job info, and provides a "Save to JobPilot" button. If unauthenticated, shows a "Sign in" button that opens the web app login.

## Route Map

### Frontend Routes

| Path                        | Auth     | Description                  |
|-----------------------------|----------|------------------------------|
| `/`                         | Public   | Landing page                 |
| `/login`                    | Guest    | Login (email/username + Google) |
| `/signup`                   | Guest    | Registration                 |
| `/dashboard`                | Required | Dashboard home (stats, activity) |
| `/dashboard/add-job`        | Required | Manual job entry form        |
| `/dashboard/analytics`      | Required | Pipeline analytics & trends  |
| `/dashboard/jobs`           | Required | Kanban board                 |
| `/dashboard/jobs/[id]`      | Required | Job detail view              |
| `/dashboard/reminders`      | Required | Reminder queue               |
| `/dashboard/settings`       | Required | User preferences & account   |
| `/_not-found`               | Public   | Custom 404 page              |

### API Routes

| Prefix            | Auth     | Description                   |
|-------------------|----------|-------------------------------|
| `GET /api/health` | Public   | Health check with DB state    |
| `POST /api/auth/*`| Mixed    | Register, login, Google, refresh, logout |
| `GET/PATCH /api/auth/me` | JWT | Profile read/update         |
| `POST /api/auth/change-password` | JWT | Password change      |
| `GET/POST/DELETE /api/jobs` | JWT | Job CRUD (paginated list) |
| `GET/PUT/PATCH/DELETE /api/jobs/:id` | JWT | Single job ops      |
| `POST /api/jobs/extract` | JWT | URL-based job extraction    |
| `GET /api/jobs/count` | JWT | Total job count              |
| `POST /api/ai/*`  | JWT + RL | AI generation (5 endpoints) |
| `POST /api/upload/*` | JWT | File upload to Cloudinary   |
| `GET/POST/PATCH /api/career-brain` | JWT | Resume profile management |
| `POST /api/system/reminders/sweep` | Secret | Manual reminder sweep |
| `GET /api/system/mail/outbox` | Secret | Debug mail queue       |

## Middleware Pipeline

```
Request
  │
  ├── requestId               ← Assigns UUID to req.id for tracing
  ├── compression()           ← Gzip/brotli response compression
  ├── hpp()                   ← HTTP parameter pollution protection
  ├── cors()                  ← Whitelist + chrome-extension:// + loopback
  ├── helmet()                ← Security headers (HSTS, XFO, XCTO, RP)
  ├── apiRateLimiter          ← 250 requests per 15 minutes (configurable)
  ├── cookieParser()          ← Parse cookies (refresh token access)
  ├── express.json(2MB)       ← JSON body parser with size limit
  ├── express.urlencoded()    ← URL-encoded body parser
  ├── sanitizeRequest()       ← Strip $, ., __proto__, constructor, prototype
  │
  ├── /api/* Router           ← Route matching
  │    │
  │    ├── Auth routes        ← authRateLimiter (12/10min) on register/login/google
  │    ├── Job routes         ← protect() middleware (JWT verify + tokenVersion)
  │    ├── AI routes          ← protect() + aiRateLimiter (20/15min)
  │    ├── Upload routes      ← protect() + multer
  │    ├── Career Brain routes ← protect() + optional multer
  │    ├── System routes      ← protectSystemRoute (shared secret header)
  │    └── Health routes      ← No auth
  │
  ├── 404 handler             ← JSON { success: false, message: "Not found" }
  └── Error handler           ← JSON { success: false, message } with status code
```
