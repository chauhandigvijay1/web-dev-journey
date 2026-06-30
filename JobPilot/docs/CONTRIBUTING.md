# Contributing to JobPilot

Thank you for your interest in contributing to JobPilot! We're building an AI-powered job application tracker with a Chrome extension, Next.js frontend, and Express backend. Every contribution — whether it's a bug fix, new feature, documentation improvement, or test — is appreciated.

## Code of Conduct

This project is committed to providing a welcoming and inclusive experience for everyone. By participating, you agree to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

Unacceptable behavior (harassment, trolling, intimidation) will not be tolerated and may result in a permanent ban from the project.

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git
- Chrome (for extension development)
- A code editor (VS Code recommended)

### Fork & Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/web-dev-journey.git
   cd web-dev-journey/JobPilot
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/chauhandigvijay1/web-dev-journey.git
   ```

### Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Root (Swagger docs)
cd .. && npm install
```

### Environment Setup

Create `.env` files from the provided examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

**Backend required variables:**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token signing secret (≥32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (≥32 chars) |
| `GROQ_API_KEY` | Groq API key for AI features |

**Frontend required variables:**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:5051`) |

### Run Locally

```bash
# Terminal 1: Backend
cd backend && npm run dev    # http://localhost:5051

# Terminal 2: Frontend
cd frontend && npm run dev   # http://localhost:3000
```

### Load the Extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `extension/` directory
4. Pin JobPilot Companion to the toolbar

---

## Development Workflow

### Branch Naming

Use descriptive names with a type prefix:

- `feat/extension-auth-flow`
- `fix/duplicate-detection`
- `refactor/job-extractor`
- `test/reminder-service`
- `docs/api-endpoints`

### Commit Messages

We follow **Conventional Commits**:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `perf`, `ci`, `build`

**Examples:**

```
feat(extension): add Wellfound board-specific extractor

fix(background): handle 401 on duplicate check endpoint

test(reminder): add pagination edge case tests

docs(api): add swagger annotations for job routes
```

### Before You Commit

1. **Lint your code:**
   ```bash
   cd frontend && npm run lint
   ```

2. **Run tests:**
   ```bash
   # Backend tests (21 tests, 5 files)
   cd backend && npm test

   # Frontend unit + component tests (125 tests, 10 files)
   cd frontend && npm test

   # E2E tests (16 tests, 4 files)
   cd frontend && npx playwright test

   # Verify total: 162 passing tests
   ```

3. **Check for type errors** (frontend):
   ```bash
   cd frontend && npx tsc --noEmit
   ```

4. **Build check** (frontend):
   ```bash
   cd frontend && npm run build
   ```

### Commit Checklist

- [ ] Code lints without warnings
- [ ] All existing tests pass
- [ ] New features include tests
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Commit message follows conventional commits format
- [ ] No secrets or credentials committed
- [ ] No `console.log` or debug code left in (use the logger in backend)

---

## Coding Standards

### Frontend (Next.js / TypeScript)

- **Language**: TypeScript. All new files must be `.ts` or `.tsx`.
- **Components**: Functional components with hooks. Follow existing patterns in `components/`.
- **State management**: Redux Toolkit (slices in `store/`). Use hooks from `store/hooks.ts`.
- **Styling**: TailwindCSS with shadcn/ui primitives. Use `cn()` utility for class merging.
- **Imports**: Group by: external libraries → internal modules → relative imports. Use absolute imports with `@/` prefix.
- **Forms**: Use controlled components with validation. See `components/auth/` for patterns.
- **Error handling**: Wrap async operations in try-catch. Use the `ErrorBoundary` component for UI errors.

### Backend (Node.js / Express)

- **Language**: JavaScript with JSDoc type annotations for all function signatures.
- **File naming**: `kebab-case` for files (`auth.service.js`), `PascalCase` for models (`Job.js`).
- **Controllers**: Keep thin — delegate business logic to services.
- **Services**: All business logic resides here. Pure functions preferred.
- **Middleware**: One concern per middleware file. See `middleware/` for examples.
- **Error handling**: Use `asyncHandler` wrapper for all route handlers. Return consistent error shapes `{ success: false, message: string }`.
- **Validation**: Use JSDoc types + manual validation in middleware. Sanitize inputs (strips `$`, `.`, `__proto__`, etc.).
- **Logger**: Use the structured logger at `src/utils/logger.js`. Never use `console.log`.

### Extension (Chrome MV3)

- **Language**: Plain JavaScript (ES5-compatible — no arrow functions, no `const`/`let`, no template literals). Chrome MV3 service workers do not support ES modules.
- **Pattern**: IIFE wrapper for all script files to avoid global pollution.
- **Storage safety**: All `chrome.storage` calls wrapped in try-catch with in-memory `Map` fallback. See `safeStorageGet`/`safeStorageSet` patterns.
- **Fetch**: All network calls use `fetchWithRetry` (AbortController + exponential backoff).
- **DOM**: Always clone the document (`document.cloneNode(true)`) before querying.
- **Text extraction**: Always cap with `MAX_TEXT_LENGTH` (50000) or `MAX_DESC_LENGTH` (500).

### General

- **ESLint**: Frontend uses `next/core-web-vitals` preset. Run `npm run lint` before committing.
- **Formatting**: No Prettier config currently — match existing code style. Use 2-space indentation.
- **No comments in production code**: Code should be self-documenting. Use descriptive variable/function names.
- **Testing**: Vitest for unit tests, Playwright for e2e. See testing section below.

---

## Testing

### Philosophy

- All new features must include tests.
- Bug fixes must include a test that reproduces the bug.
- Tests should be deterministic — no sleep-based waits; use proper assertions.
- Mock external services (Groq API, SMTP, Cloudinary) in unit tests.

### Test Structure

```
backend/tests/
├── unit/            # Pure function tests (auth.service, job-extraction, etc.)
└── integration/     # API route tests (api.test.js)

frontend/tests/
├── unit/            # Pure function tests (107 tests)
├── components/      # Component tests (18 tests)
└── e2e/             # Playwright tests (14 tests)
```

### Running Tests

```bash
# All backend tests
cd backend && npm test

# All frontend tests
cd frontend && npm test

# Specific frontend test file
cd frontend && npx vitest run tests/unit/auth-validation.test.ts

# E2E tests (requires both servers running)
cd frontend && npx playwright test

# Extension-specific e2e tests
cd frontend && npx playwright test tests/e2e/extension-popup.spec.ts

# Watch mode
cd backend && npm run dev
cd frontend && npx vitest
```

### Writing Tests

**Unit tests** — test pure functions in isolation:

```typescript
// frontend/tests/unit/example.test.ts
import { describe, it, expect } from 'vitest';

describe('functionName', () => {
  it('handles expected input', () => {
    expect(functionName('input')).toBe('output');
  });

  it('handles edge case', () => {
    expect(functionName(null)).toBe('');
  });
});
```

**Component tests** — test rendering and interactions:

```typescript
// frontend/tests/components/example.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
```

**E2E tests** — test full user flows (Playwright):

```typescript
// frontend/tests/e2e/example.spec.ts
import { test, expect } from '@playwright/test';
```

---

## Pull Request Process

### Creating a PR

1. Create a branch from `main` with a descriptive name
2. Make your changes, following the coding standards above
3. Run the full test suite and ensure everything passes
4. Push your branch and open a pull request

### PR Description Template

```markdown
## Description

<!-- Briefly describe what this PR does and why -->

## Related Issues

Closes #<issue-number>

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Documentation
- [ ] Tests
- [ ] CI/CD

## Testing

<!-- Describe the tests you added or changed -->

- [ ] All existing tests pass
- [ ] New tests cover the change
- [ ] Tested manually (describe steps)

## Checklist

- [ ] Linted (`npm run lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`) — frontend only
- [ ] Build succeeds (`npm run build`) — frontend only
- [ ] No secrets or credentials committed
- [ ] Commit messages follow conventional commits
```

### Review Process

1. At least one maintainer review required
2. All CI checks must pass
3. Address review feedback with additional commits (no force-pushing after review starts)
4. Once approved, a maintainer will merge your PR

### After Merge

- Delete your branch (GitHub offers a button after merge)
- Update your fork: `git remote update upstream && git rebase upstream/main`

---

## Project Structure

```
JobPilot/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── app.js              # Express app setup
│   │   ├── server.js           # Server startup
│   │   ├── config/             # env, database, cloudinary
│   │   ├── controllers/        # Route handlers (thin)
│   │   ├── middleware/         # Auth, upload, validation, security
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── services/           # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── job.service.js
│   │   │   ├── mail.service.js
│   │   │   ├── reminder.service.js
│   │   │   ├── email-templates.service.js
│   │   │   └── job-extraction/ # URL-based job parsing
│   │   └── utils/              # Logger, JWT helpers, Groq client
│   └── tests/
│       ├── unit/
│       └── integration/
│
├── frontend/                   # Next.js 14 (App Router)
│   ├── app/                    # Pages (login, signup, dashboard, etc.)
│   ├── components/             # React components
│   │   ├── auth/               # Auth forms, session sync
│   │   ├── dashboard/          # Dashboard shell, reminder bell
│   │   ├── job/                # Kanban, cards, dialogs, detail views
│   │   ├── analytics/          # Charts and trends
│   │   └── ui/                 # shadcn/ui primitives
│   ├── hooks/                  # Shared React hooks
│   ├── lib/                    # Utilities, types, auth storage
│   ├── store/                  # Redux Toolkit slices
│   ├── services/               # API client
│   └── tests/
│       ├── unit/
│       ├── components/
│       └── e2e/
│
├── extension/                  # Chrome MV3 extension
│   ├── icons/                  # PNG + SVG icons
│   ├── content.js              # Job scraping script
│   ├── background.js           # Service worker
│   ├── popup.html              # Popup UI
│   ├── popup.js                # Popup logic
│   └── manifest.json           # Extension manifest
│
├── docs/                       # Documentation
│   ├── audit/                  # Context tracking
│   └── api/                    # API docs (via swagger-jsdoc)
│
└── screenshots/                # App screenshots for README
```

---

## Reporting Issues

### Bug Reports

When filing a bug report, please include:

```markdown
**Describe the bug**
A clear and concise description of the issue.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots / Logs**
If applicable, add screenshots or backend logs.

**Environment (please complete):**
- OS: [e.g. Windows 11, macOS Sonoma]
- Browser: [e.g. Chrome 126]
- Extension Version: [e.g. 1.0.0]
- Node Version: [e.g. 20.x]

**Additional context**
Any other context about the problem.
```

### Feature Requests

```markdown
**Problem**
What problem does this feature solve? (e.g. "I'm always frustrated when...")

**Proposed Solution**
A clear description of what you want to happen.

**Alternatives Considered**
Any alternative solutions or features you've considered.

**Additional Context**
Mockups, references, or examples from other tools.
```

---

## Getting Help

- Open an issue for bugs or feature requests
- Reach out to the maintainer: [Digvijay Kumar Singh](https://github.com/chauhandigvijay1)
- For extension-specific questions, see [docs/EXTENSION.md](./EXTENSION.md)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License (same as the project).
