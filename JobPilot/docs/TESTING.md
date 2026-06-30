# Testing Guide

## Testing Philosophy

JobPilot follows a layered testing strategy:

- **Unit tests** validate isolated logic — utility functions, validators, pure computations.
- **Component tests** render React components with mock data and verify output.
- **Integration tests** exercise Express route handlers with a real (in-memory) database.
- **E2E tests** simulate real user flows across the full stack using Playwright.

The goal is reliable, fast feedback. Unit and component tests run in seconds. Integration tests use `mongodb-memory-server` to avoid external dependencies. E2E tests spin up all required servers automatically.

---

## Test Suite Overview

| Suite | Tests | Files | Framework | Location |
|---|---|---|---|---|
| Backend unit | 9 | 4 | Vitest | `backend/tests/unit/` |
| Backend integration | 12 | 1 | Vitest + Supertest | `backend/tests/integration/` |
| Frontend unit | 107 | 7 | Vitest + jsdom | `frontend/tests/unit/` |
| Frontend component | 18 | 3 | Vitest + @testing-library/react | `frontend/tests/components/` |
| E2E | 16 | 4 | Playwright | `frontend/tests/e2e/` |
| **Total** | **162** | **19** | | |

---

## Backend Testing

### Setup

The backend tests use:
- **Vitest** as the test runner
- **Supertest** for HTTP assertions against the Express app (without listening on a real port)
- **mongodb-memory-server** to simulate MongoDB in-memory
- Environment variables are set in `backend/tests/setup.js`

The test environment is isolated — the `NODE_ENV` is set to `test` and real SMTP credentials are cleared.

### Running

```powershell
# Run all backend tests
cd backend
npm.cmd test

# Run with coverage
npm.cmd run test:coverage
```

Test timeout is configured in `vitest.config.js` (defaults to Vitest's 5s, but the integration tests may need longer for MongoDB memory server startup).

### Test Structure

Test files follow the convention `<name>.test.js` and are organized in two directories:

| Directory | Purpose | Example file |
|---|---|---|
| `tests/unit/` | Pure logic, no IO | `auth.service.test.js`, `job-extraction.test.js`, `email-templates.test.js`, `reminder.service.test.js` |
| `tests/integration/` | Full HTTP route tests | `api.test.js` |

**Example — unit test:**

```js
import { describe, expect, it } from "vitest";

describe("auth.service", () => {
  it("normalizes settings with defaults and bounds", () => {
    const result = normalizeSettings({});
    expect(result.reminderHour).toBe(9);
    expect(result.autoMarkGhostedDays).toBe(30);
  });
});
```

**Example — integration test:**

```js
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import supertest from "supertest";
import { app } from "../src/app.js";

describe("API integration", () => {
  it("registers, protects routes, and refreshes access tokens", async () => {
    const res = await supertest(app)
      .post("/api/auth/register")
      .send({ email: "test@test.com", password: "ValidPass123!", name: "Test" });
    expect(res.status).toBe(201);
  });
});
```

---

## Frontend Unit Testing

### Setup

- **Vitest** with `@vitejs/plugin-react`
- **jsdom** environment (simulates browser DOM in Node.js)
- Test setup file: `frontend/tests/setup.ts` (configures `@testing-library/jest-dom` matchers)
- Path alias `@/` resolves to `frontend/`

### Running

```powershell
# Run all frontend unit + component tests
cd frontend
npm.cmd test

# Run with coverage
npm.cmd run test:coverage
```

### Test Structure

Unit tests are in `frontend/tests/unit/` and test pure utility functions:

| File | Tests | What it tests |
|---|---|---|
| `analytics.test.ts` | ~11 | `computeJobAnalytics` aggregation function |
| `auth-validation.test.ts` | ~22 | `normalizeUsernameInput`, `isValidEmailAddress`, password validation |
| `follow-up-date.test.ts` | ~18 | Date parsing/serialization utilities |
| `job-ghosting.test.ts` | ~10 | `isAutoGhosted` logic |
| `kanban-filters.test.ts` | ~9 | `uniqueTrimmed` and filter utilities |
| `reminders.test.ts` | ~12 | Reminder computation logic |
| `httpError.test.ts` | ~8 | Error class and handling |

---

## Component Testing

### Setup

Same as unit testing, plus `@testing-library/react` and `@testing-library/user-event` for rendering and interaction.

### Running

Component tests run alongside unit tests with `npm.cmd test`. They are in `frontend/tests/components/`:

| File | Tests | What it tests |
|---|---|---|
| `auth-shell.test.tsx` | ~6 | Page layout shell (title, description, hero cards) |
| `password-field.test.tsx` | ~6 | Input field with show/hide toggle, validation |
| `error-boundary.test.tsx` | ~3 | Error fallback UI |

**Example — component test:**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthShell } from "@/components/auth/auth-shell";

describe("AuthShell", () => {
  it("renders title, description, and eyebrow", () => {
    render(
      <AuthShell
        title="Welcome Back"
        description="Sign in to your account"
        eyebrow="JobPilot"
      >
        <div>child</div>
      </AuthShell>
    );
    expect(screen.getByText("Welcome Back")).toBeDefined();
  });
});
```

---

## E2E Testing

### Setup

E2E tests use **Playwright** with three servers that the Playwright config launches automatically:

| Server | Command | Port | URL |
|---|---|---|---|
| Backend API | `npm.cmd run dev` (with test env vars) | 5051 | `http://localhost:5051/api/health` |
| Fixture server | `node tests/e2e/fixture-server.mjs` | 4010 | `http://127.0.0.1:4010/job-posting` |
| Frontend (Next.js) | `npm.cmd run dev` (with `NEXT_PUBLIC_API_URL`) | 3000 | `http://localhost:3000` |

The Playwright config (`frontend/playwright.config.ts`) uses `reuseExistingServer: true` — if a server is already running, it reuses it instead of starting a new one.

### Running

```powershell
cd frontend

# Run all E2E tests (auto-starts all servers)
npx.cmd playwright test

# Run a specific test file
npx.cmd playwright test tests/e2e/auth.spec.ts

# Run with UI mode
npx.cmd playwright test --ui

# Show the HTML report
npx.cmd playwright show-report
```

### Fixture Server

The fixture server (`frontend/tests/e2e/fixture-server.mjs`) is a minimal HTTP server that simulates:

| Endpoint | Response |
|---|---|
| `GET /job-posting` | HTML page with schema.org `JobPosting` LD+JSON |
| `GET /not-a-job` | Generic HTML (no job data) |
| `POST /api/auth/login` | Mock login (accepts `test@jobpilot.app` / `TestPass123!`) |
| `POST /api/auth/register` | Mock registration (rejects `existing@jobpilot.app`) |
| `GET /api/jobs` | Paginated mock job list (requires Bearer token) |

### Test Structure

| File | Tests | What it covers |
|---|---|---|
| `auth.spec.ts` | 4 | Login form rendering, error display, signup navigation |
| `landing.spec.ts` | 3 | Landing page heading, navigation links |
| `dashboard.spec.ts` | 4 | Auth guard redirects for protected routes |
| `extension-popup.spec.ts` | 5 | Content script job detection on fixture pages |

---

## Writing Tests

### Conventions

1. **File naming:** `<name>.test.ts` for unit, `<name>.test.tsx` for components, `<name>.spec.ts` for E2E.
2. **Describe blocks:** Group related tests with `describe("module name", ...)`.
3. **Test names:** Use descriptive sentences — `it("rejects private network URLs", ...)`.
4. **No external dependencies:** Unit tests must not hit the network, database, or filesystem. Use `vi.mock()` to mock dependencies.
5. **Integration tests** use `mongodb-memory-server` — call `beforeAll` to start it, `afterAll` to stop.
6. **E2E tests** use the fixture server, not the real backend. Never rely on production data.

### Patterns

**Mocking a module:**

```js
import { vi } from "vitest";
vi.mock("@/services/api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));
```

**Component with providers:**

```tsx
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

function renderWithProviders(ui, { preloadedState } = {}) {
  const store = configureStore({ reducer, preloadedState });
  return render(<Provider store={store}>{ui}</Provider>);
}
```

**Playwright page object pattern (E2E):**

```ts
test("login page renders the form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("h1")).toHaveText("Welcome Back");
});
```

---

## CI/CD Integration

The test suite runs in CI on every push and pull request. A recommended GitHub Actions workflow:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Backend tests
        run: |
          cd backend
          npm ci
          npm test
      - name: Frontend unit + component tests
        run: |
          cd frontend
          npm ci
          npm test
      - name: E2E tests
        run: |
          cd frontend
          npx playwright install --with-deps chromium
          npx playwright test
```

> **Note:** E2E tests require the Playwright browsers (`npx playwright install`) and take ~2 minutes to run on CI.

---

## Coverage Targets

Current test coverage is tracked weekly. Targets:

| Suite | Current Target |
|---|---|
| Backend unit | ≥ 70% |
| Backend integration | Functional coverage of all routes |
| Frontend unit | ≥ 80% |
| Frontend component | ≥ 70% |
| E2E | All critical user flows covered |

Run coverage reports locally:

```powershell
cd backend && npm.cmd run test:coverage
cd frontend && npm.cmd run test:coverage
```

Reports are output in `text` (terminal) and `lcov` (HTML) formats:
- Backend: `backend/coverage/`
- Frontend: `frontend/coverage/`
