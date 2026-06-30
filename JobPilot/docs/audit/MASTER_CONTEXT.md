# JobPilot - Master Audit & Fix Context

## Project State (as of 2026-06-30)
- **Status**: Production-deployed but not production-ready
- **Backend**: Node.js + Express + MongoDB (Render)
- **Frontend**: Next.js 14 (Vercel)
- **Extension**: Chrome MV3 (unpublished)

## Critical Issues Found

### SECURITY (Fix IMMEDIATELY)
1. `.env` committed to git with production secrets (MongoDB URI, JWT secrets, API keys, SMTP creds)
2. SSRF in `job-extraction/index.js:177` - fetches user-supplied URLs with no IP blocklist
3. XSS in `JobDetailView.tsx:708` - contact LinkedIn URL rendered without protocol validation
4. Extension has no CSP in manifest.json
5. CORS accepts `null` origin in `app.js`
6. JWT_REFRESH_SECRET falls back to JWT_SECRET if not set

### BACKEND BUGS
1. Uncaught errors from service layer → 500 instead of 404
2. TOCTOU race in registration (two concurrent same-email signups)
3. No pagination on `GET /api/jobs`
4. Password change doesn't invalidate sessions
5. No rate limiting on AI routes
6. Health endpoint doesn't check DB connectivity
7. SMTP config cached forever (never re-checks)
8. Username generation loops 10K queries
9. `/auth/refresh` returns 200 with `success:false` instead of 401

### FRONTEND BUGS
1. `JobDetailView.tsx` 1021 lines - SRP violation
2. `settings/page.tsx` 897 lines - SRP violation
3. `/api/jobs` fetched 4-5x independently across components
4. No error boundary at app/dashboard level
5. Google auth button re-initializes on every render
6. `hooks/` directory empty
7. Contact URL XSS vector
8. `react-markdown` unused dependency
9. Duplicate `completeAuth` in login/signup
10. Jobs count fetches ALL jobs instead of a count endpoint

### EXTENSION BUGS
1. Content script runs on `<all_urls>` (privacy concern)
2. No CSP in manifest
3. Popup always says "detected a job posting" even on non-job pages
4. No inline sign-in - requires web app first
5. No loading state on save button
6. No accessibility attributes

### TESTING GAPS
1. Backend controllers: ~20% coverage
2. Backend middleware: 0%
3. Frontend lib: ~10% (1 test)
4. Frontend components: 0%
5. Extension: 0%
6. E2E: 0% (Playwright config exists, no tests)

## Fix Order
1. SECURITY (env, SSRF, XSS, CSP, CORS, JWT)
2. BACKEND (pagination, uncaught errors, race, password, rate limits, health)
3. FRONTEND (split components, boundaries, hooks, caching, URL validation)
4. EXTENSION (standalone, CSP, content script scope, error handling)
5. TESTS (backend unit + integration, frontend lib, service)
6. E2E tests
7. README + screenshots
8. Final cleanup+commit

## Key Decisions
- Use RTK Query instead of React Query (already have Redux Toolkit)
- Remove react-markdown from dependencies
- Keep localStorage-based auth (extension needs it) but add httpOnly flag awareness
- Add Vercel Analytics / Sentry for error tracking
- Create `hooks/useJobs.ts` as shared data hook
- Remove swagger UI from root package.json (doesn't belong there)
