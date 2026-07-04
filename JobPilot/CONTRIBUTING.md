<div align="center">
  <img src="./docs/assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Contributing to JobPilot</h1>
  <p><em>The comprehensive engineering guide for collaborating on the JobPilot ecosystem.</em></p>
</div>

---

Thank you for your interest in contributing to JobPilot! We're building an AI-powered career operating system encompassing a Next.js client, an Express backend, and a Manifest V3 Chrome Extension. Every contribution matters.

## 📑 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [Local Environment Setup](#-local-environment-setup)
3. [Development Workflow & Commits](#-development-workflow--commits)
4. [Strict Coding Standards](#-strict-coding-standards)
5. [Testing Matrix (160+ Tests)](#-testing-matrix-160-tests)
6. [Pull Request Process](#-pull-request-process)
7. [Repository Structure](#-repository-structure)
8. [Reporting Issues](#-reporting-issues)

---

## 🤝 Code of Conduct

This project enforces a strict, welcoming environment. By participating, you agree to:
- Be respectful of differing engineering viewpoints.
- Provide constructive, empathetic code reviews.
- Focus on what is best for the end-user.
*(See our full [Code of Conduct](./CODE_OF_CONDUCT.md) for enforcement tiers).*

---

## 🚀 Local Environment Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)
- Google Chrome (For MV3 Extension Development)

### 2. Fork & Clone
```bash
git clone https://github.com/<your-username>/web-dev-journey.git
cd web-dev-journey/JobPilot
git remote add upstream https://github.com/chauhandigvijay1/web-dev-journey.git
```

### 3. Install Dependencies
```bash
# Backend
cd backend && npm install
# Frontend
cd ../frontend && npm install
```

### 4. Environment Injection
Copy the provided templates. **Never expose real credentials.**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

**Backend `.env` Requirements:**
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/jobpilot` (Example) |
| `JWT_SECRET` | Must be ≥32 characters. |
| `JWT_REFRESH_SECRET` | Must be ≥32 characters. |
| `GROQ_API_KEY` | `gsk_placeholder...` |

**Frontend `.env.local` Requirements:**
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5051` |

### 5. Spin Up the Ecosystem
```bash
# Terminal 1: API Daemon
cd backend && npm run dev    

# Terminal 2: Next.js Client
cd frontend && npm run dev   
```

### 6. Load the MV3 Extension
1. Open Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer mode**.
3. Click **Load unpacked** and select the `/extension` directory.

---

## 🌿 Development Workflow & Commits

### Branch Naming Conventions
- `feat/extension-auth-flow`
- `fix/duplicate-detection`
- `refactor/job-extractor`
- `test/reminder-service`
- `docs/api-endpoints`

### Conventional Commits
We strictly follow Conventional Commits to automate SemVer releases:
```text
<type>(<scope>): <description>

[optional body]
```
*Examples: `feat(extension): add Wellfound extractor` or `fix(background): handle 401 recovery`*

### The Pre-Commit Checklist
Before pushing your branch, you must verify the following:
```bash
# 1. Lint the Client
cd frontend && npm run lint

# 2. Compile TypeScript
cd frontend && npx tsc --noEmit

# 3. Verify Build Matrix
cd frontend && npm run build
```

---

## 💻 Strict Coding Standards

### Frontend (Next.js 14 / TypeScript)
- **Language**: TypeScript (`.ts` / `.tsx`).
- **State**: Redux Toolkit slices reside in `store/`. Consume via `store/hooks.ts`.
- **Styling**: TailwindCSS via `shadcn/ui`. Utilize the `cn()` utility for merging classes.
- **Imports**: Group imports: External → Internal → Relative. Use `@/` alias.

### Backend (Express 5 / Node.js)
- **Language**: JavaScript with highly strict JSDoc type annotations.
- **Architecture**: Keep Controllers thin. Route all business logic through `services/`.
- **Error Handling**: Wrap all handlers in `asyncHandler`. Standardize responses: `{ success: false, message: string }`.
- **Logging**: Never use `console.log`. Inject the Winston structured logger (`src/utils/logger.js`).

### Extension (Chrome MV3)
- **Language**: ES5-compatible Plain JavaScript (Service Workers do not support ES Modules natively).
- **Isolation**: Use IIFE wrappers to prevent global scope pollution.
- **Defensive Storage**: Wrap `chrome.storage.local` calls in `try/catch` with in-memory `Map` fallbacks.

---

## 🧪 Testing Matrix (160+ Tests)

All bug fixes must include a regression test. All features require test coverage.

### Running the Matrix
```bash
# Backend (21 Tests)
cd backend && npm test

# Frontend Unit (125 Tests)
cd frontend && npm test

# Playwright End-to-End (16 Tests)
cd frontend && npx playwright test
```

### Writing Tests
**Unit Tests (Vitest)**
```typescript
import { describe, it, expect } from 'vitest';
describe('jobExtractor', () => {
  it('handles null nodes gracefully', () => {
    expect(extractor(null)).toBe('');
  });
});
```

---

## 🚀 Pull Request Process

1. Create your descriptive branch from `main`.
2. Ensure your changes pass all Lints, TSC checks, and the 162-Test Matrix.
3. Open a Pull Request referencing the GitHub Issue (e.g., `Closes #12`).
4. **Peer Review**: A maintainer will review the code. Do not force-push after a review has started.
5. Upon approval, the branch will be squash-merged into `main`.

---

## 🗺️ Repository Structure

```text
JobPilot/
├── backend/                    # Express API Daemon
│   ├── src/
│   │   ├── config/             # Environment, Database configs
│   │   ├── controllers/        # Thin HTTP Handlers
│   │   ├── middleware/         # Auth, Validation, Rate Limits
│   │   ├── models/             # Mongoose Schemas
│   │   └── services/           # Business Logic (Auth, Jobs, Cron)
│   └── tests/                  # Unit & Integration Tests
│
├── frontend/                   # Next.js 14 Client
│   ├── app/                    # App Router Pages
│   ├── components/             # React UI & shadcn primitives
│   ├── lib/                    # Utils, Type definitions
│   └── store/                  # Redux State Management
│
├── extension/                  # Chrome MV3 Web Scraper
│   ├── background.js           # Ephemeral Service Worker
│   ├── content.js              # DOM Ingestion Logic
│   └── manifest.json           # Permissions config
│
└── docs/                       # Official Knowledge Base
```

---

## 🎫 Reporting Issues

When submitting a Bug Report via GitHub Issues, please include:
1. **Clear Description & Expected Behavior.**
2. **Reproduction Steps.**
3. **Environment**: OS (Windows 11), Browser (Chrome 126), Node Version (20.x).
4. **Relevant Server Logs or Console Traces.**

<br/>
<div align="center">
  <em>By contributing, you agree your code will be released under the MIT License.</em>
</div>
