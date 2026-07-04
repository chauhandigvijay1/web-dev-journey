<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Open Source Contributing Guide</h1>
  <p><em>Architectural standards, workflows, and protocols for engineering JobPilot.</em></p>
</div>

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Development Environment Bootstrap](#-development-environment-bootstrap)
3. [Monorepo Architecture](#-monorepo-architecture)
4. [Engineering Workflows](#-engineering-workflows)
5. [Code Quality & Style Conventions](#-code-quality--style-conventions)
6. [Commit & CI/CD Protocols](#-commit--cicd-protocols)
7. [Related Documentation](#-related-documentation)

---

## 🎯 Executive Summary

JobPilot thrives on community engineering. Whether you are optimizing a MongoDB aggregation pipeline, designing a new React Server Component, or writing a robust Playwright E2E test, this guide outlines the standards required to merge your code into the `main` branch. 

> [!IMPORTANT]
> **Zero-Regression Mandate:** Before submitting a Pull Request, ensure that you have written corresponding Unit or Integration tests for your feature, and that the existing 160+ test matrix passes locally.

---

## 🚀 Development Environment Bootstrap

### 1. Core Prerequisites
- **Node.js:** `v18.x` or higher (mandatory for ESM support).
- **Database:** A local MongoDB instance or a free MongoDB Atlas URI.
- **Inference API:** A Groq API key (Available at [groq.com](https://groq.com)).

### 2. Repository Initialization
```bash
git clone https://github.com/your-username/web-dev-journey.git
cd web-dev-journey/JobPilot

# Initialize Monorepo Dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Configuration
Create the required local environment variables. Reference the [Environment Guide](./environment.md) for deeper contexts.

**`backend/.env`**
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_super_secure_32_character_string
JWT_REFRESH_SECRET=your_other_super_secure_string
GROQ_API_KEY=gsk_your_groq_key
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5051
```

### 4. Process Execution
Spin up the development environments concurrently:
```bash
# Terminal 1: API Core
cd backend && npm run dev

# Terminal 2: Presentation Layer
cd frontend && npm run dev
```

---

## 🏗️ Monorepo Architecture

JobPilot is logically segmented to enforce strict separation of concerns.

```text
JobPilot/
├── backend/                # 🚦 Express 5 API (Native ESM)
│   ├── src/
│   │   ├── controllers/    # HTTP translation layer
│   │   ├── middleware/     # Security guards (Helmet, JWT, SSRF)
│   │   ├── models/         # Mongoose strict schemas
│   │   └── services/       # Core business logic algorithms
│   └── tests/              # Vitest + Supertest integration matrix
├── frontend/               # ⚛️ Next.js 14 App Router
│   ├── src/
│   │   ├── app/            # Edge routing and Server Components
│   │   ├── components/     # shadcn/ui library primitives
│   │   └── store/          # Redux Toolkit global state
│   └── tests/              # Playwright E2E + React Testing Library
└── extension/              # 🧩 Chrome Manifest V3 Core
    ├── background.js       # Ephemeral Service Worker
    └── content.js          # DOM Traversal & Extraction Engine
```

---

## 🔄 Engineering Workflows

1. **Issue Claiming:** Check the GitHub Issues tab. Comment to claim an issue to prevent duplicated effort.
2. **Branching:** Checkout a semantic branch: `git checkout -b feat/add-resume-parsing` or `fix/jwt-sync-bug`.
3. **Execution:** Write the code following the conventions below.
4. **Validation:** Execute `npm test` in both `frontend` and `backend` directories.
5. **Submission:** Push your branch and open a Pull Request targeting `main`.

---

## 🎨 Code Quality & Style Conventions

### The Backend (Node + Express)
- **Native ESM:** Utilize modern `import` / `export` syntax exclusively.
- **Controller/Service Split:** Controllers should only parse HTTP request/responses. All complex algorithmic logic must reside in `src/services/`.
- **Async/Await:** Avoid `.then()` chaining. Utilize `try/catch` wrappers alongside Express 5's native async routing.

### The Frontend (React + Next.js)
- **Strict Typing:** TypeScript is mandatory. Avoid `any` types. Define precise Interfaces for all API payloads.
- **State Management:** Use Redux Toolkit *only* for global authentication state. Use local hooks (like the `useJobs` LRU cache) for server-state data.
- **Styling:** Adhere to Tailwind CSS utility classes utilizing our custom CSS variable theme engine (e.g., `bg-primary`, `text-muted`).

### The Extension (Vanilla JS)
- **Defensive Programming:** The extension operates in a hostile DOM environment. Wrap all `chrome.storage` interactions in `try/catch` blocks.
- **DOM Safety:** Never mutate the host page DOM directly.

---

## 📝 Commit & CI/CD Protocols

JobPilot strictly enforces **Conventional Commits** to automate changelog generation.

| Prefix | Description | Example |
|--------|-------------|---------|
| `feat:` | A new feature or capability. | `feat(ai): integrate llama-3.3-70b` |
| `fix:` | A bug resolution. | `fix(extension): resolve storage crash in incognito` |
| `docs:` | Updates to the markdown suite. | `docs(architecture): map JWT flow` |
| `test:` | Adding or refactoring test suites. | `test(auth): add integration suite for OAuth` |
| `refactor:`| Code structural change without logic change. | `refactor(jobs): decouple LRU cache` |

### Pull Request Standards
- **Atomic Commits:** Keep PRs highly focused. Do not mix unrelated bug fixes with new feature development.
- **Contextual Descriptions:** Utilize the PR template. Explain *why* a change was made, not just *what* was changed.
- **CI Validation:** Ensure the GitHub Actions pipeline resolves cleanly before requesting a maintainer review.

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **Testing Standards** | [Testing Infrastructure](./testing.md) |
| **System Design** | [Architecture Details](./architecture.md) |
| **Security Guidelines** | [Security Documentation](./security.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="../README.md">Return to Home →</a>
</div>
