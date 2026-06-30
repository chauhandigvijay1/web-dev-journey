# JobPilot AI

**Full-stack AI-powered job application tracker** with a browser extension for one-click saving. Track applications with Kanban, receive email reminders, analyze your pipeline, and manage your job hunt smarter.

- **Frontend:** Next.js 14 (App Router), TailwindCSS, shadcn/ui, deployed on Vercel
- **Backend:** Node.js, Express, MongoDB (Mongoose), deployed on Render
- **Extension:** Chrome MV3, auto-detects jobs on 22+ domains, saves to your account
- **AI Layer:** Groq API (Llama 3) for resume parsing, cover letters, career coaching

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://jobpilot-client-chi.vercel.app |
| Backend API | https://web-dev-journey-cnee.onrender.com |
| Extension | Load unpacked from `extension/` |

## Features

- **Auth:** Email/password + Google OAuth, JWT (7d access tokens), refresh tokens with separate secret
- **Job management:** Add/edit/delete, status workflow (Saved → Applied → Interview → Offer → Rejected), drag-drop Kanban
- **Analytics:** Pipeline funnel, status distribution, weekly trends, follow-up queue
- **AI tools:** Resume parsing (DOCX/PDF), job extraction from URL, cover letter gen, interview prep, skill gap analysis, career strategy
- **Reminders:** Automated email follow-up alerts via node-cron, configurable delay
- **Extension (JobPilot Companion):** One-click save from LinkedIn, Indeed, Wellfound, Greenhouse, Naukri, and 16+ other boards. Auto-detects job title, company, location from page content and LD+JSON. Works offline — injects content script on-demand if not pre-registered.

## Screenshots

| Dashboard | Analytics | Kanban |
|-----------|-----------|--------|
| <img src="./screenshots/dashboard.png" width="280"> | <img src="./screenshots/Analytics.png" width="280"> | <img src="./screenshots/jobs.png" width="280"> |
| **Login** | **Signup** | **Extension** |
| <img src="./screenshots/login_page.png" width="280"> | <img src="./screenshots/signup_page.png" width="280"> | <img src="./screenshots/extension_popup.png" width="280"> |

## Local Setup

### Prerequisites
- Node.js 18+, MongoDB (local or Atlas), Git

### 1. Clone
```bash
git clone https://github.com/chauhandigvijay1/web-dev-journey.git
cd web-dev-journey/JobPilot
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, GROQ_API_KEY
npm run dev            # starts on http://localhost:5051
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_URL
npm run dev                        # starts on http://localhost:3000
```

### 4. Extension (Chrome)
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `extension/` folder
4. Pin the JobPilot icon to the toolbar

### 5. Verify
- Register/login at http://localhost:3000
- Open the extension popup on a job board page — it should detect the job and show "Save to JobPilot"
- All **20 backend tests pass**: `cd backend && npm test`

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (access tokens) |
| `JWT_REFRESH_SECRET` | Yes | Separate secret for refresh tokens |
| `GROQ_API_KEY` | Yes | For all AI features |
| `SMTP_HOST` | For reminders | SMTP server |
| `SMTP_PORT` | For reminders | SMTP port |
| `SMTP_USER` | For reminders | SMTP username |
| `SMTP_PASS` | For reminders | SMTP password |
| `FROM_EMAIL` | For reminders | Sender email address |
| `CLIENT_URL` | For CORS | Frontend URL (default: http://localhost:3000) |

### Frontend (`frontend/.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For Google auth | Google OAuth client ID |

## Extension Auth Flow

1. User logs in on the web app → token stored in `localStorage.jobpilot_token`
2. Content script on web app detects the token → sends `SYNC_AUTH_TOKEN` to background service worker
3. Background worker stores token + expiry in `chrome.storage.local`
4. Popup reads storage: if token exists and not expired → user is "authenticated"
5. Save button sends `SAVE_JOB` to background → background calls `POST /api/jobs` with Bearer token
6. If 401 → background removes token, requests re-sync from any open JobPilot tab, retries
7. If no token at all → popup shows "Sign in to JobPilot" button → opens web app login

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Chrome Extension│────▶│  Next.js Frontend│────▶│  Express Backend    │
│  (popup/content) │     │  (Vercel)        │     │  (Render)           │
│  chrome.storage  │     │  Redux + localStorage   │  MongoDB (Atlas)   │
│  + scripting API │     │  shadcn/ui        │     │  Groq API + cron   │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

## Manual Verification Steps

After deployment, verify each of these flows:

### Web App
- [ ] Register a new account → redirected to dashboard
- [ ] Login with email/username → dashboard loads with 0 jobs
- [ ] Google OAuth login works
- [ ] Add a job manually (title, company, location, status) → appears in Kanban
- [ ] Drag a job card to a different status column → status updates
- [ ] Navigate to Analytics → charts show data (or empty state)
- [ ] Navigate to Settings → update preferences, save
- [ ] Logout → redirected to login page
- [ ] Visit `/login` while already logged in → redirected to dashboard

### Backend
- [ ] `GET /api/health` returns `{ success: true, data: { db: "connected" } }`
- [ ] `GET /api/jobs` with `?page=1&limit=10` returns paginated results
- [ ] `POST /api/jobs/extract` with a valid URL returns extracted fields
- [ ] `POST /api/jobs/extract` with `http://localhost:27017/` returns warning (SSRF protection)
- [ ] AI routes return 429 after 20 requests in 15 minutes (rate limit)

### Extension
- [ ] Load unpacked → JobPilot icon appears in toolbar
- [ ] Open LinkedIn job posting → popup shows job title/company + "Save to JobPilot"
- [ ] Click "Save to JobPilot" → status shows "Job saved!" (requires auth)
- [ ] Sign out of web app → open extension → shows "Sign in to JobPilot"
- [ ] Click "Sign in to JobPilot" → opens web app login in new tab
- [ ] Open a non-job page (e.g. Google) → popup shows "No job detected"

### Tests
- [ ] Run `cd backend && npm test` → 21 tests pass (5 files)
- [ ] `GET /api/jobs/count` returns `{ data: { count: N } }`
- [ ] Run `cd frontend && npm run build` → builds without errors

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, shadcn/ui, Redux Toolkit |
| Backend | Node.js, Express, Mongoose, JWT, bcrypt |
| Database | MongoDB Atlas |
| AI | Groq API (Llama 3 70B / Mixtral 8x7B) |
| Job parsing | TinyFish API (URL extraction) |
| Reminders | nodemailer + node-cron |
| Extension | Chrome MV3, Scripting API, Storage API |
| Uploads | Multer + Cloudinary |
| Testing | Vitest, Supertest |
| CI/CD | Vercel (frontend), Render (backend) |

## Deployment

### Frontend (Vercel)
- Root directory: `JobPilot/frontend`
- Framework preset: Next.js
- Env: `NEXT_PUBLIC_API_URL` = production backend URL

### Backend (Render)
- Root directory: `JobPilot/backend`
- Start command: `npm start`
- Env: All variables from `.env` (use Render's environment)

### Extension (Chrome Web Store)
- Zip the `extension/` folder
- Upload to Chrome Developer Dashboard
- Auto-deploys on git push (GitHub Actions optional)

## Project Structure
```
JobPilot/
├── backend/           # Express API server
│   ├── src/
│   │   ├── config/    # env, database, cors
│   │   ├── controllers/
│   │   ├── middleware/ # auth, upload, validation
│   │   ├── models/    # Mongoose schemas
│   │   ├── routes/    # Express routers
│   │   └── services/  # Business logic, AI, extraction
│   └── tests/         # Vitest (unit + integration)
├── frontend/          # Next.js app
│   ├── app/           # App router pages
│   ├── components/    # React components (shadcn/ui)
│   ├── hooks/         # Shared hooks (useJobs, etc.)
│   ├── lib/           # Utilities, auth storage
│   └── store/         # Redux slices
├── extension/         # Chrome MV3 extension
│   ├── icons/         # PNG + SVG icons
│   ├── popup.html     # Popup UI
│   ├── popup.js       # Popup logic
│   ├── content.js     # Job scraping on pages
│   ├── background.js  # Service worker (auth, API calls)
│   └── manifest.json
├── docs/audit/        # Context tracking (phase docs)
└── screenshots/       # App screenshots
```

## License

MIT — built by [Digvijay Kumar Singh](https://github.com/chauhandigvijay1)
