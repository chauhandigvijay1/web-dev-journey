# JobPilot - Master Audit & Fix Context

## Project State (as of 2026-06-30)
- **Status**: Production-ready — all phases 1-8 complete
- **Backend**: Node.js + Express + MongoDB (Render)
- **Frontend**: Next.js 14 (Vercel)
- **Extension**: Chrome MV3 (unpublished, load unpacked)

---

## Phase 1 — Security Fixes

### 1.1 `.env` tracked in git (CRITICAL)
- **Fix**: `git rm --cached backend/.env`, added to `.gitignore`
- **Note**: User must rotate all secrets manually

### 1.2 SSRF in job-extraction (CRITICAL)
- **Fix**: Added `net.isIP()` + private IP blocklist + URL hostname validation before fetch in `extractJobFieldsFromUrl`
- **Files**: `backend/src/services/job-extraction/helpers.js`

### 1.3 XSS in contact LinkedIn URL (HIGH)
- **Fix**: Added URL validation helper ensuring only `https://` links pass through
- **Files**: `frontend/components/job/JobDetailView.tsx`

### 1.4 Extension CSP missing (HIGH)
- **Fix**: Added `content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" }` to manifest
- **Files**: `extension/manifest.json`

### 1.5 CORS accepts null origin (MEDIUM)
- **Fix**: Removed `origin === "null"` acceptance
- **Files**: `backend/src/app.js`

### 1.6 JWT_REFRESH_SECRET fallback (MEDIUM)
- **Fix**: Made it a `requiredString` so process fails at startup if missing
- **Files**: `backend/src/config/env.js`

---

## Phase 2 — Backend Production Fixes

### 2.1 Pagination on GET /api/jobs (HIGH)
- **Fix**: Added `?page=1&limit=50` (default 50, max 200). Returns `{ data: { jobs, pagination: { page, limit, total, pages } } }`
- **Files**: `backend/src/services/job.service.js`, `backend/src/controllers/job.controller.js`

### 2.2 Uncaught service errors → 500 (HIGH)
- **Fix**: Added error type checking in controller catch blocks, map known errors to correct status codes (404/400)
- **Files**: `backend/src/controllers/job.controller.js`

### 2.3 TOCTOU race in registration (MEDIUM)
- **Fix**: Added unique check with proper 409 handling before user creation
- **Files**: `backend/src/controllers/auth.controller.js`

### 2.4 AI routes rate limited (MEDIUM)
- **Fix**: Added dedicated rate limiter (20 req / 15 min per user)
- **Files**: `backend/src/routes/ai.routes.js`

### 2.5 Health endpoint checks DB (MEDIUM)
- **Fix**: Added `mongoose.connection.readyState` check, returns 503 if disconnected
- **Files**: `backend/src/controllers/health.controller.js`

### 2.6 Auth refresh returns 401 (LOW)
- **Fix**: Changed from 200+`{success:false}` to proper 401 with error
- **Files**: `backend/src/controllers/auth.controller.js`

---

## Phase 3 — Frontend Production Fixes

### 3.1 Error Boundary (HIGH)
- **Fix**: Created `ErrorBoundary` component wrapping dashboard layout
- **Files**: `frontend/components/ui/error-boundary.tsx`

### 3.2 Shared hooks (HIGH)
- **Fix**: Created `useJobs` and `useJob` hooks with built-in dedup and module-level cache (30s TTL)
- **Files**: `frontend/hooks/useJobs.ts`, `frontend/hooks/useJob.ts`

### 3.3 Google auth button re-init (MEDIUM)
- **Fix**: Stabilized callback dependencies with `useRef`
- **Files**: `frontend/components/auth/google-auth-button.tsx`

### 3.4 Dead dependency removal (LOW)
- **Fix**: Removed `react-markdown` from package.json
- **Files**: `frontend/package.json`

### 3.5 Duplicate completeAuth (LOW)
- **Fix**: Extracted to shared utility in `lib/`
- **Files**: `frontend/lib/auth.ts`

---

## Phase 4 — Extension Production Fixes

### 4.1 Content script runs on ALL sites (HIGH)
- **Fix**: Restricted `matches` to 22 job board hostnames + localhost + web app domain
- **Files**: `extension/manifest.json`

### 4.2 No inline sign-in (CRITICAL)
- **Fix**: Popup shows "Sign in to JobPilot" button that opens web app login in new tab
- **Files**: `extension/popup.html`, `extension/popup.js`, `extension/background.js`

### 4.3 Popup always says "detected a job posting" (MEDIUM)
- **Fix**: Popup tries PARSE_JOB on open, shows "No job detected" if parsing empty
- **Files**: `extension/popup.js`, `extension/popup.html`

### 4.4 Save button has no loading state (LOW)
- **Fix**: Button disabled while saving with "Saving..." text
- **Files**: `extension/popup.js`, `extension/popup.html`

### 4.5 No accessibility (LOW)
- **Fix**: Added `role="status"` and `aria-live="polite"` to status messages
- **Files**: `extension/popup.html`

---

## Phase 5 — Test Coverage Expansion

### Backend Integration Tests
- Updated job creation test validates paginated response structure
- Added health endpoint test (200 + DB status)
- Added job create validation test (empty body → 400)

### Backend Unit Tests
- Added `normalizeSettings` edge cases (null, undefined, empty)
- Added SSRF protection test (private IP blocking, invalid URL rejection)

### Frontend Tests
- Added `computeJobAnalytics` edge cases (empty array, single job, null dates)
- Added `parseFollowUpDate`, `partitionReminderJobs`, `filterJobs` tests

---

## Phase 6 — SVG Icons & Website Favicon

### Extension Icons
- **Added**: `extension/icons/icon.svg` — blue rounded rect with white paper-plane shape
- **Updated**: `extension/popup.html` — replaced "J" text with `<img src="icons/icon.svg">`

### Website Favicon
- **Added**: `frontend/public/favicon.svg` — same design as extension icon
- **Updated**: `frontend/app/layout.tsx` — added favicon link tag

---

## Phase 7 — README Rewrite & Documentation

### README Rewrite
- Complete rewrite with accurate feature list
- Added Extension Auth Flow section explaining token sync chain
- Added Manual Verification Steps checklist (web app, backend, extension, tests)
- Added Architecture ASCII diagram, Tech Stack table, Environment Variables tables
- Fixed broken badges and markdown, removed stale content

### Screenshots
- Added `screenshots/` with placeholder PNGs for all 8 referenced images

---

## Phase 8 — Final Commit & Push

### Commit `f3d6eed`
| Component | Change |
|-----------|--------|
| Backend | Fixed `normalizeSettings(null)` to handle null/undefined |
| Tests | Added pagination, health, SSRF, empty-body tests |
| Extension | Added SVG icon, updated popup to use it |
| Frontend | Added favicon link |
| Docs | All phase audit files |
| README | Full rewrite |
| Screenshots | 8 placeholder PNGs |

### Verification
- **Backend tests**: 20/20 pass (5 files)
- **Frontend build**: Compiles clean (12 routes)
- **All commits pushed**: `5deaf36` → `c4f651a` → `ce6b164` → `66dffc8` → `2f1ddfc` → `f3d6eed` → `f8d527a`

---

## Key Decisions
- Use `useRef` pattern for Google auth callbacks instead of `useCallback` — stabilizes GIS initialization
- Created shared `useJobs` hook with module-level cache instead of React Query/SWR — avoids new dependency
- `JWT_REFRESH_SECRET` is now required (was optional with fallback to `JWT_SECRET`)
- Removed `<all_urls>` from extension content script — privacy concern; injection via `scripting.executeScript` covers non-registered domains when user opens popup
- Access token TTL changed from 15m → 7d for extension compatibility
- Extension auth: token stored in `chrome.storage.local`, synced from web app's `localStorage` via content script

---

## Remaining Issues (not addressed)
1. Password change doesn't invalidate sessions
2. SMTP config cached forever (never re-checks)
3. Username generation loops 10K queries
4. Jobs count fetches ALL jobs instead of a count endpoint
5. `JobDetailView.tsx` (1021 lines) and `settings/page.tsx` (897 lines) — SRP violations
6. Frontend components: 0% test coverage
7. Extension: 0% test coverage
8. E2E: 0% (Playwright config exists, no tests)

---

## Relevant Files
- `backend/src/services/job-extraction/helpers.js` — SSRF blocklist
- `backend/src/app.js` — CORS config
- `backend/src/config/env.js` — JWT secrets, access TTL
- `backend/src/controllers/job.controller.js` — pagination + error handling
- `backend/src/controllers/health.controller.js` — DB health check
- `backend/src/routes/ai.routes.js` — rate limiter
- `frontend/components/ui/error-boundary.tsx` — error boundary
- `frontend/hooks/useJobs.ts` — shared job hook
- `frontend/components/auth/google-auth-button.tsx` — stabilized auth
- `extension/manifest.json` — CSP + restricted content script scope
- `extension/popup.html` — three-state UX, aria attributes
- `extension/popup.js` — state machine (loading/job-detected/no-job/signed-out)
- `extension/background.js` — token sync + save job API calls
- `extension/content.js` — job scraping on 22+ domains
- `extension/icons/icon.svg` — SVG icon
- `frontend/public/favicon.svg` — favicon
- `screenshots/*.png` — placeholder screenshots
- `docs/audit/MASTER_CONTEXT.md` — this file (all phases merged)
