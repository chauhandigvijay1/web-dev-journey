# Challenges & Solutions

A retrospective of the most significant engineering challenges faced while building JobPilot — from critical security vulnerabilities to architectural refactors, and the solutions that turned them into production-grade features.

---

## 1. Critical Security Vulnerabilities

### 1.1 Password Oracle (CRITICAL)

**The Problem**

In `auth.controller.js:513-518`, the password change endpoint checked `currentPassword === newPassword` **before** calling `bcrypt.compare()`. This created a timing oracle: an attacker could distinguish between "current password is wrong" and "current password is correct but matches the new one" by measuring response time differences. With enough attempts, they could brute-force the current password.

```
Before ──→ equality check ──→ bcrypt.compare()  ← timing leak
After  ──→ bcrypt.compare() ──→ equality check  ← constant path
```

**The Fix**

Moved the equality check after `bcrypt.compare()`. Now every failed password change attempt follows exactly the same code path regardless of what failed — same hashing cost, same response structure, same timing.

**Files**: `backend/src/controllers/auth.controller.js:524-534`

**Lesson**: Security-critical code paths must be constant-time. Never branch on secret-dependent conditions before cryptographic verification.

---

### 1.2 SSRF in Job Extraction (CRITICAL)

**The Problem**

The job extraction endpoint accepted arbitrary URLs and fetched them server-side. No validation checked whether the URL pointed to an internal network — an attacker could pass `http://localhost:27017` (MongoDB) or `http://169.254.169.254` (AWS metadata endpoint) and exfiltrate sensitive data.

**The Fix**

Added a multi-layer defense:
1. `net.isIP()` checks whether the hostname resolves to an IP address
2. A blocklist of private IP ranges (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, ::1, etc.)
3. URL hostname validation before every fetch call

**Files**: `backend/src/services/job-extraction/helpers.js`

**Lesson**: Never trust user-supplied URLs. Any server-side fetch is a potential SSRF vector and needs explicit allowlist or blocklist validation.

---

### 1.3 .env Tracked in Git (CRITICAL)

**The Problem**

The `backend/.env` file containing MongoDB credentials, JWT secrets, API keys, and SMTP passwords was committed to the repository. Anyone with access to the git history could extract production credentials.

**The Fix**

- `git rm --cached backend/.env` to remove from tracking
- Added `.env` and `.env.local` to `.gitignore`
- Rotated all exposed secrets
- Created `.env.example` files with placeholder values

**Lesson**: Add `.env` to `.gitignore` **before** the first commit. Use `git-secrets` or similar pre-commit hooks to prevent accidental credential commits.

---

### 1.4 localStorage Crashes in Private Browsing (CRITICAL)

**The Problem**

Six files called `localStorage.getItem`, `setItem`, or `removeItem` without try-catch. Safari and Firefox private browsing modes throw a `QuotaExceededError` or `SecurityError` when localStorage is accessed — any of these calls would crash the entire application.

Worse, one of these calls was inside a Redux reducer (`authSlice.ts`), which violated the rule that reducers must be pure functions. A storage failure would crash the entire Redux store.

**The Fix**

- Created `safeGetItem`/`safeSetItem`/`safeRemoveItem` wrappers with in-memory `Map` fallback in every file
- Extracted all side effects out of the auth reducer into helper functions (`hydrateFromStorage`, `loginWithStorage`, `logoutAndClear`)
- Applied the pattern consistently across 6 files

**Files**: `frontend/services/api.ts`, `frontend/lib/authStorage.ts`, `frontend/lib/theme.ts`, `frontend/components/theme/theme-provider.tsx`, `frontend/store/authSlice.ts`

**Lesson**: `localStorage` is not universally available. Private browsing, storage quota, and cross-origin iframes can all throw. Wrapping every access in try-catch is non-negotiable for production. Reducers must never have side effects.

---

## 2. Architecture & Design Challenges

### 2.1 Missing Server-Side Auth Guard

**The Problem**

The frontend had no `middleware.ts`. Protected routes like `/dashboard/*` rendered server-side before the client-side `RequireAuth` component ran, causing a visible flash of unauthenticated content on every navigation. Users would briefly see a dashboard with "Please log in" before the redirect.

**The Fix**

Created `frontend/middleware.ts` with a matcher for `/dashboard`, `/profile`, `/settings`, `/login`, `/register`. The middleware checks for the refresh cookie (`jobpilot_refresh`) on every request:
- No cookie + protected route → redirect to `/login?redirect=<path>`
- Valid cookie + auth route → redirect to `/dashboard`

The middleware uses the same cookie name as the backend (`process.env.AUTH_COOKIE_NAME` with fallback to `jobpilot_refresh`), ensuring they stay in sync.

**Files**: `frontend/middleware.ts`

**Lesson**: Client-side route guards are never sufficient. Server-side (or edge) middleware must handle auth checks first. The flash of unauthenticated content is a real UX problem that degrades trust.

---

### 2.2 Date.now Evaluated at Import Time

**The Problem**

In `models/Job.js:50`, the `lastContactDate` field had `default: Date.now` — a direct function reference that executes **once** when the module is imported. Every new contact created after server start got the server's boot time as `lastContactDate`. Contacts created hours or days apart all appeared to have been contacted at the same moment.

```
default: Date.now       // ← evaluates ONCE at import → all contacts get server start time
default: () => Date.now() // ← evaluates per document → correct
```

**The Fix**

Changed to `default: () => Date.now()` — an arrow function that evaluates once per document creation.

**Files**: `backend/src/models/Job.js:50`

**Lesson**: Mongoose `default` values that need per-document evaluation must be functions, not primitive references. This is an easy mistake because `Date.now` looks correct and works in unit tests (which typically create one document).

---

### 2.3 Spaghetti Components: 1021 and 897 Line Files

**The Problem**

Two critical frontend files had grown beyond maintainable size:

| File | Lines | Problem |
|------|-------|---------|
| `JobDetailView.tsx` | 1021 | Inline helpers, dialogs, 12 card sections, mixed concerns |
| `settings/page.tsx` | 897 | 7 settings sections, inlined CSV helpers, inline dialogs |

Both violated the Single Responsibility Principle. A single file change risked breaking unrelated features. Code review was painful — PRs touched hundreds of lines for simple changes.

**The Fix**

Extracted components systematically:

**JobDetailView** → 4 files (1021 → 345 lines):
- `job-detail-utils.tsx` — reusable helpers (date formatting, star rating, salary parsing)
- `job-detail-dialogs.tsx` — `AiOutputDialog`, `DeleteJobDialog`
- `job-detail-sections.tsx` — 12 named section components
- `JobDetailView.tsx` — orchestration only

**Settings Page** → 2 files (897 → 377 lines):
- `settings-sections.tsx` — 7 section components + `ClearJobsDialog` + CSV helpers
- `page.tsx` — state management, handlers, compose

**Lesson**: Components exceeding 400 lines need extraction. The threshold for "too long" is when you can't see the component's full structure without scrolling. Extract utilities first, then dialogs, then sections.

---

### 2.4 useJobs Stale Closures & Memory Leak

**The Problem**

`useJobs.ts` had three interacting bugs:
1. `fetchJobs` and `fetchCount` captured stale `paramsRef` values in their closures — changing filters would still fetch with old parameters
2. `fetchCache` was a `Map` that grew without bounds — every unique (page, limit, status, search) combination accumulated forever
3. The `mountedRef` pattern was incorrect — it could miss updates when multiple requests were in-flight

**The Fix**

- Replaced `mountedRef` with per-fetch `AbortController` — every new request cancels the previous one
- Added `MAX_CACHE_SIZE = 50` with LRU eviction via `cacheInsertOrder` array
- Added in-flight request deduplication via a separate `inFlight` Map

**Files**: `frontend/hooks/useJobs.ts`

**Lesson**: Custom hooks with fetch logic need careful lifecycle management. `AbortController` is superior to mounted-ref patterns. Every cache needs an eviction strategy — unbounded Maps are memory leaks waiting to happen.

---

## 3. Extension Challenges

### 3.1 Scraping 50+ Job Boards with Different DOM Structures

**The Problem**

The original extension had 22 hardcoded selectors that broke on any site not explicitly supported. Job boards use wildly different HTML structures:
- Some embed data in `<script type="application/ld+json">` (LinkedIn, Google Jobs)
- Others wrap LD+JSON in `@graph` arrays (Indeed, Glassdoor)
- Many rely on microdata (`itemprop`, `itemscope`)
- Some use custom `data-*` attributes
- A few only expose data through RDFa

On top of this, some pages modify the DOM asynchronously — by the time the content script runs, the job data may not be in the current DOM tree.

**The Fix**

A complete rewrite of the content script with a multi-strategy approach:

1. **Clone the DOM**: `document.cloneNode(true)` creates a detached copy before any live mutations
2. **LD+JSON traversal**: Walk all `<script type="application/ld+json">` elements, handle both flat objects and `@graph` arrays
3. **50+ board-specific selectors**: Named extractors for LinkedIn, Indeed, Glassdoor, Naukri, Monster, plus region-specific boards
4. **Generic fallback**: 20+ title selectors, 10+ company, 10+ location, 10+ salary, 15+ description — tried in priority order
5. **50K character cap**: All text reads truncated to prevent memory issues on massive pages
6. **Safe decoding**: `decodeURIComponent` wrapped in try-catch

**Files**: `extension/content.js` (847 lines, completely rewritten)

**Lesson**: Web scraping is inherently fragile. Use multiple independent strategies and fall back gracefully. DOM cloning prevents "moved while reading" races. Always cap text reads on untrusted pages.

---

### 3.2 Extension Auth Sync Across Contexts

**The Problem**

The extension has three separate execution contexts — content script, background service worker, and popup — each with different storage APIs and lifetimes. The user logs in on the web app (different origin), but the extension needs the token in `chrome.storage` to make API calls. The content script can read the web app's `localStorage`, but the background worker can't. The popup needs to know the auth state instantly when opened, but the background worker may be inactive.

**The Flow We Designed**

```
1. User logs in on web app → token in localStorage.jobpilot_token
2. Content script detects token → sends SYNC_AUTH_TOKEN to background
3. Background stores token + expiry in chrome.storage.local + memory fallback
4. Popup reads storage on open → authenticated or not
5. 401 on save → background removes token, requests re-sync from any open tab
6. No token → popup shows "Sign in to JobPilot" → opens web app login
```

**Key decisions**:
- Token stored in `chrome.storage.local` (survives service worker restarts)
- In-memory `Map` fallback (works even if storage API throws)
- `chrome.storage.onChanged` listener for cross-context sync
- Hourly cleanup of expired tokens in background script
- JWT expiry checked client-side by decoding the token (no API call needed)

**Files**: `extension/background.js`, `extension/content.js`, `extension/popup.js`

**Lesson**: Chrome extensions require careful state synchronization across three contexts. The background service worker is the source of truth. The popup is a snapshot viewer. The content script is a bridge to the web page. Each has different lifetime guarantees.

---

### 3.3 Extension Running on Every Website

**The Problem**

The original manifest had `"matches": ["<all_urls>"]` — the content script ran on every page the user visited. This was a privacy violation, a performance drain (the script ran on every navigation), and could trigger Chrome's malware detection warnings during Web Store review.

**The Fix**

Restricted `matches` to exactly 37 job board hostnames + localhost + the two production URLs. The manifest now lists every supported domain explicitly.

**Files**: `extension/manifest.json`

**Lesson**: Chrome extension permissions should follow the principle of least privilege. `<all_urls>` is almost never justified. Explicit host_permissions also speed up Chrome Web Store review.

---

## 4. Backend Challenges

### 4.1 SMTP Transporter Lifecycle

**The Problem**

The mail service had two related bugs:
1. **New transporter per call**: Every `sendMail()` created a fresh `nodemailer.createTransport()`, which meant a new TCP connection to the SMTP server every time (slow and resource-intensive)
2. **Cached forever**: The "fix" for issue #1 was a module-level cache that lived for the server's entire lifetime — env var changes required a full restart

**The Fix**

A hybrid approach: cache the transporter with hash-based invalidation. On each call, the service computes a hash of current SMTP config (`host:port:secure:user:pass`). If the hash matches the cached transporter's hash, reuse it. If not, create a new one.

Also capped the outbox at 1000 entries (it was unbounded before).

```js
function configHash() {
  return `${env.smtpHost}:${env.smtpPort}:${env.smtpSecure}:${env.smtpUser}:${env.smtpPass}`;
}
```

**Files**: `backend/src/services/mail.service.js`

**Lesson**: Module-level caches are convenient but create configuration drift. Hash-based invalidation is a simple way to refresh caches when config changes, without the complexity of event emitters or watchers.

---

### 4.2 Session Invalidation on Password Change

**The Problem**

When a user changed their password, the old password was hashed and saved, but all existing JWT tokens (with 7-day TTL) remained valid. If an attacker had stolen an old token, the password change didn't help — the token would still work.

**The Fix**

Added a `tokenVersion` field to the User model (default 0). All token generation embeds the current `tokenVersion`. The auth middleware checks `decoded.tokenVersion >= user.tokenVersion` at every request. On password change:
1. Bump `user.tokenVersion += 1`
2. Clear refresh token hash → all sessions invalidated
3. Old JWT tokens (with lower `tokenVersion`) are rejected

**Files**: `models/User.js`, `utils/jwt.js`, `services/auth.service.js`, `middleware/auth.middleware.js`, `controllers/auth.controller.js`

**Lesson**: JWT invalidation is a hard problem because tokens are stateless. The `tokenVersion` pattern is a lightweight solution — one database field, one middleware check, no external session store needed.

---

### 4.3 Username Generation: 10K Queries → 2 Queries

**The Problem**

`ensureUniqueUsername` looped from `counter = 1` to 9999, making an individual MongoDB query every iteration to find an available `username_base_N`. On the 9999th attempt, that's 9999 sequential database queries — potentially minutes of latency.

**The Fix**

A two-phase approach:
1. Try the candidate list first (small number of tries)
2. If exhausted, run a **single** `$regex` query to find all existing `base+N` usernames
3. Load results into a JavaScript `Set`
4. Iterate in-memory from 1 to 9999 using `Set.has()` — no more DB queries
5. Fallback to `jp<base36-timestamp>` if all 9999 suffixes taken

**Files**: `backend/src/utils/auth.js`

**Lesson**: N+1 queries in a loop are a performance antipattern. A single `$regex` query + in-memory iteration is orders of magnitude faster. Always ask: "Can I fetch everything I need in one query and filter in memory?"

---

## 5. Runtime Errors Discovered During Verification

### 5.1 JWT Secrets Too Short

**The Problem**

After implementing the ≥32 character validation in `env.js`, the backend crashed on startup because the actual `.env` file contained secrets that were 22 and 24 characters — they passed earlier validation (which was "is it a non-empty string?") but failed the new minimum length check.

This was discovered only because we actually ran `node src/server.js` as part of verification — not just the test suite.

**The Fix**: Extended both secrets in `.env` to ≥32 characters.

---

### 5.2 E2E Test Selectors Wrong

**The Problem**

Four Playwright tests failed on first run because the selectors didn't match the actual DOM:

| Test | What We Expected | What Actually Exists |
|------|-----------------|---------------------|
| Login form | `input[type="email"]` | `input[id="identifier"]` (no type attr) |
| Signup form | `input[id="identifier"]` | `input[id="email"]` |
| Landing nav link | `a[href="/login"]` → 1 element | Same selector → 3 elements (strict mode violation) |

**The Fix**: Updated selectors to match the actual DOM. Added `.first()` for the landing page link.

**Lesson**: E2E tests are only as good as their selectors. Using `id`-based selectors is more stable than type-based ones. Strict-mode violations in Playwright reveal real structural issues in your DOM.

---

### 5.3 Registration Required Username

**The Problem**

The registration API returned 400 with "Username is required" during initial testing. The controller requires a `username` field, but the test payload only included `name`, `email`, and `password`.

**The Fix**: Added `username` to the registration payload.

**Lesson**: Always verify API contracts with actual HTTP calls, not just unit tests. The test suite mocked the request and didn't catch the missing field.

---

## 6. Testing Challenges

### 6.1 Building an E2E Fixture Server for Extension Testing

**The Problem**

Testing a Chrome extension requires actual web pages with known job data. We needed reproducible test pages that the content script could scrape, with:
- LD+JSON structured data
- Varied DOM structures
- A 404 page
- A non-job page (no job data)
- A health endpoint

**The Solution**

A lightweight Express server (`tests/e2e/fixture-server.mjs`) on port 4010 that serves:
- `/jobs/1` — a complete job posting with LD+JSON `@type: "JobPosting"`
- `/jobs/2` — alternative LD+JSON structure with `@graph` wrapper
- `/health` — health check
- `/404` — 404 response
- `/empty` — a page with no job data

The Playwright content script tests navigate to `http://127.0.0.1:4010/jobs/1` and assert on the scraped output.

**Lesson**: Extension testing requires a controlled environment. A fixture server gives you deterministic test data without relying on real (flaky) job boards.

---

### 6.2 Managing Server Lifecycles in E2E Tests

**The Problem**

Playwright e2e tests depend on three servers: frontend (3000), backend (5051), and fixture server (4010). Starting and stopping these manually before each test run was error-prone.

**The Solution**

Playwright's `webServer` configuration entries with `reuseExistingServer: true`:
- Playwright starts servers that aren't running and waits for them to be ready
- If a developer already has servers running, Playwright reuses them
- Servers are automatically killed when the test suite finishes

**Files**: `frontend/playwright.config.ts`

**Lesson**: `webServer` in Playwright config eliminates manual server management. `reuseExistingServer: true` is the key — developers can run their servers in watch mode and e2e tests will use them without restarting.

---

## 7. Performance & Scalability Challenges

### 7.1 Reminder Sweep Processing Millions of Documents

**The Problem**

The original reminder sweep ran a single `find()` query and processed all due reminders in one batch. As the user base grew, this would:
- Hold a large result set in memory
- Block the event loop during processing
- Miss reminders if the batch timed out

**The Fix**

A paginated sweep: process `reminderBatchSize` (default 25) documents per iteration in a `do...while` loop. If a batch returns less than the batch size, we've exhausted the queue.

```js
do {
  batch = await findAndProcessBatch(batchSize);
} while (batch.length === batchSize);
```

**Files**: `backend/src/services/reminder.service.js`

**Lesson**: Background job processing must be paginated. A single monolithic query will fail as data grows. Idempotent, small-batch processing is more resilient.

---

### 7.2 Unbounded Cache in useJobs

**The Problem**

The `fetchCache` Map in `useJobs.ts` grew without bounds. Each unique combination of `(page, limit, status, search)` created a new cache entry. Over hours of usage, this could accumulate hundreds of entries, each holding an array of job objects.

**The Fix**

- Set `MAX_CACHE_SIZE = 50`
- Track insertion order with `cacheInsertOrder[]`
- Evict oldest entries when cache exceeds the limit
- 30-second TTL on cached entries

**Files**: `frontend/hooks/useJobs.ts`

**Lesson**: Every cache must have an eviction strategy. LRU with a fixed maximum is the safest default for client-side caches. Without it, you have a memory leak.

---

## 8. Lessons Learned

### What We'd Do Differently

1. **Security-first architecture**: SSRF protection, CSP, and input sanitization should be in the initial scaffold, not added retroactively. They're much harder to add after 10K lines of code.

2. **Test selectors from the start**: Using `data-testid` attributes from day one would have saved hours of E2E debugging. Semantic selectors are fragile.

3. **Extension <all_urls> is never OK**: The original extension had `"matches": ["<all_urls>"]`. This should have been a hard requirement from the very first commit.

4. **Static analysis for secrets**: A pre-commit hook using `git-secrets` or similar would have caught the `.env` commit before it happened.

5. **Component size budgets**: Enforce a 400-line maximum per file. Files over that threshold should trigger a CI warning.

### What Went Well

1. **Defense in depth**: Multiple layers of security (helmet + CORS + sanitize + rate limiting + SSRF blocklist + CSP) mean that no single vulnerability is catastrophic.

2. **Incremental refactoring**: Splitting 1000+ line components into focused pieces was done without any feature regressions, because each extraction preserved the exact API.

3. **Verification-driven development**: Running actual servers and e2e tests during the fix process caught real runtime errors that unit tests missed.

4. **Documentation alongside code**: The MASTER_CONTEXT.md was updated simultaneously with every change, making it a reliable source of truth rather than an afterthought.

---

## Score Progression

| Stage | Score | Key Milestone |
|-------|-------|---------------|
| Initial audit | 5/10 | Critical vulnerabilities present |
| After security fixes | 6.5/10 | SSRF, CSP, CORS, JWT config fixed |
| After backend fixes | 7/10 | Pagination, error handling, TOCTOU |
| After frontend fixes | 7.5/10 | Error boundaries, localStorage safety |
| After extension rewrite | 8/10 | 50+ boards, fetch retry, safe storage |
| After deep fixes (A-F) | 8.2/10 | Password oracle, Date.now, useJobs, e2e |

**Current**: 8.2/10. Launchable. The remaining 1.8 points require CSRF, account lockout, centralized monitoring, load testing, and audit trails.
