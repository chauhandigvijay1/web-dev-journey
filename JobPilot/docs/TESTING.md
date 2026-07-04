<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Testing Infrastructure</h1>
  <p><em>The multi-layered testing matrix ensuring zero-regression deployments.</em></p>
</div>

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Test Suite Topology](#-test-suite-topology)
3. [Backend Integration Matrix](#-backend-integration-matrix)
4. [Frontend Component Testing](#-frontend-component-testing)
5. [End-to-End (E2E) Workflows](#-end-to-end-e2e-workflows)
6. [Testing Code Guidelines](#-testing-code-guidelines)
7. [Related Documentation](#-related-documentation)

---

## 🎯 Executive Summary

JobPilot maintains a rigid, four-tier testing architecture guaranteeing high confidence across the stack. We deploy **160+ automated tests** utilizing Vitest, React Testing Library, and Playwright. The testing pipeline is designed to catch logic errors at the unit level, rendering issues at the component level, and critical user-flow regressions at the E2E level.

> [!TIP]
> **No Mocked Databases for Integration:** To prevent false positives, our backend integration tests do not mock Mongoose. Instead, we spin up a localized, ephemeral `mongodb-memory-server` ensuring tests run against a real MongoDB binary engine in milliseconds.

---

## 📊 Test Suite Topology

| Suite Category | Total Tests | Framework Stack | Execution Boundary |
|----------------|-------------|-----------------|--------------------|
| **Backend Unit** | 9+ | Vitest | `backend/tests/unit/` |
| **Backend Integration** | 12+ | Vitest + Supertest | `backend/tests/integration/` |
| **Frontend Unit** | 100+ | Vitest + jsdom | `frontend/tests/unit/` |
| **Frontend Component** | 18+ | Vitest + `@testing-library/react` | `frontend/tests/components/` |
| **End-to-End (E2E)** | 16+ | Playwright | `frontend/tests/e2e/` |

---

## ⚙️ Backend Integration Matrix

Backend tests validate the robustness of the Express 5 monolith.

**Environment:** Vitest + Supertest + `mongodb-memory-server`

### Running the Suite
```bash
cd backend
npm test                  # Run full matrix
npm run test:coverage     # Generate Istanbul coverage report
```

### Integration Pattern Example
We test the entire HTTP lifecycle, including middleware, schema validation, and routing.
```typescript
describe("Authentication Flow Integration", () => {
  it("successfully registers, mints JWTs, and accesses protected routes", async () => {
    // 1. Simulate Client Request
    const res = await supertest(app)
      .post("/api/auth/register")
      .send({ email: "test@domain.com", password: "ValidPass123!", name: "Test" });
      
    // 2. Assert HTTP Protocol
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });
});
```

---

## ⚛️ Frontend Component Testing

Frontend testing separates pure algorithmic logic (like the LRU cache) from DOM rendering logic.

**Environment:** Vitest + jsdom + `@testing-library/jest-dom`

### Execution
```bash
cd frontend
npm test
```

### Core Coverage Areas
- **Algorithms:** `kanban-filters.test.ts`, `reminders.test.ts`, and `follow-up-date.test.ts` test the heavy mathematical logic detached from React.
- **Rendering:** `auth-shell.test.tsx` and `error-boundary.test.tsx` mount the UI in `jsdom` to verify aria-labels, layout structures, and state transitions.

---

## 🎭 End-to-End (E2E) Workflows

The E2E suite verifies that the Next.js Frontend, the Express Backend, and the Chrome Extension communicate flawlessly under real browser conditions.

**Environment:** Playwright (Chromium, WebKit, Firefox)

### The E2E Orchestration Server
To prevent E2E tests from corrupting development databases, Playwright orchestrates three concurrent localized servers:
1. The **Backend API** (`localhost:5051`)
2. The **Next.js Frontend** (`localhost:3000`)
3. A custom **Fixture Server** (`localhost:4010`) serving static HTML mocks of job boards (e.g., simulating a LinkedIn page with `LD+JSON` schemas to test the Extension parsing).

### Running Playwright
```bash
cd frontend
npx playwright test                    # Headless execution
npx playwright test --ui               # Interactive visual debugger
```

---

## 📝 Testing Code Guidelines

When contributing to JobPilot, adhere to these strict paradigms:

1. **File Conventions:**
   - Pure functions: `fileName.test.ts`
   - React components: `fileName.test.tsx`
   - E2E Playwright flows: `feature.spec.ts`
2. **Absolute Isolation:** Unit tests must **never** make network calls. Utilize `vi.mock()` to intercept Axios.
3. **E2E Independence:** E2E tests must never assume a clean database. They must create their own user accounts via the API, execute the flow, and clean up.

### Coverage Targets
- **Backend:** `> 70%` global coverage; `100%` route integration coverage.
- **Frontend:** `> 80%` on utility functions; `> 70%` on core UI components.

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **Backend API** | [API Reference](./api.md) |
| **Extension Workflows** | [Extension Documentation](./extension.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="../README.md">Return to Home →</a>
</div>
