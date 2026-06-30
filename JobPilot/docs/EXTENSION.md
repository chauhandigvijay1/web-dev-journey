# JobPilot Companion — Extension Guide

> Chrome MV3 extension for one-click job saving across 50+ job boards. Part of the [JobPilot](https://github.com/chauhandigvijay1/web-dev-journey) platform.

## Overview

JobPilot Companion is a Chrome extension that detects job postings on any supported board, extracts structured data (title, company, location, salary, description, skills, work mode, job type), and saves them directly to your JobPilot account with one click. It supports 37 host permissions covering 30+ named domains plus a generic LD+JSON / microdata fallback that works on thousands of additional sites.

**Version:** 1.0.1  
**Manifest:** MV3  
**Shortcut:** `Alt+Shift+J` (Windows/Linux), `Option+Shift+J` (Mac)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Chrome Page                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  content.js (injected on job boards)              │   │
│  │  - DOM cloning + scraping                         │   │
│  │  - LD+JSON / microdata / board-specific fallback   │   │
│  │  - Syncs auth token from web app via runtime msg   │   │
│  └────────────┬─────────────────────────────────────┘   │
└───────────────┼─────────────────────────────────────────┘
                │ chrome.runtime.sendMessage
                ▼
┌─────────────────────────────────────────────────────────┐
│  background.js (service worker)                          │
│  - JWT enforcement (exp + 7d TTL)                       │
│  - Token storage with in-memory Map fallback            │
│  - Fetch with AbortController + exponential backoff     │
│  - 401 recovery: remove token → request re-sync → retry │
│  - Hourly expired token cleanup                         │
│  - chrome.storage.onChanged listener                    │
└────────────┬────────────────────────────────────────────┘
             │ chrome.runtime.sendMessage
             ▼
┌─────────────────────────────────────────────────────────┐
│  popup.html + popup.js                                   │
│  - Connection status indicator (green/red dot)          │
│  - States: loading, no-job, signed-out, job-detected,   │
│    saving, saved, error                                 │
│  - GET_STATUS from background on open                   │
│  - SAVE_JOB from background on click                    │
└────────────┬────────────────────────────────────────────┘
             │ POST /api/jobs (Bearer token)
             ▼
┌─────────────────────────────────────────────────────────┐
│  JobPilot Web App (Next.js) + API (Express)              │
│  - Auth: JWT access + refresh tokens                    │
│  - Job CRUD, Kanban, Analytics, AI tools                │
│  - Token stored in localStorage.jobpilot_token          │
└─────────────────────────────────────────────────────────┘
```

### Message Flow

| Message | Sender | Receiver | Purpose |
|---------|--------|----------|---------|
| `SYNC_AUTH_TOKEN` | content.js | background.js | Syncs JWT from web app to extension storage |
| `REQUEST_TOKEN_SYNC` | background.js | content.js | Requests re-sync when 401 occurs |
| `PARSE_JOB` | popup.js | content.js | Triggers scraping of current page |
| `SAVE_JOB` | popup.js | background.js | Saves extracted job via API |
| `GET_STATUS` | popup.js | background.js | Checks auth status + job count |

---

## File Structure

```
extension/
├── manifest.json        # Chrome extension manifest (MV3)
├── content.js           # Content script — job scraping on all supported domains
├── background.js        # Service worker — auth, token management, API calls
├── popup.html           # Popup UI — states, styling, layout
├── popup.js             # Popup logic — auth check, parsing, save flow
└── icons/
    ├── icon16.png       # Toolbar / favicon (16×16)
    ├── icon48.png       # Extensions management (48×48)
    ├── icon128.png      # Chrome Web Store (128×128)
    └── icon.svg         # Popup header icon (vector)
```

---

## Auth Flow

The extension uses the JWT created when the user logs in on the JobPilot web app. The token is stored in `localStorage.jobpilot_token` on the web app domain.

### Step-by-Step

1. **User logs in** on the web app → token saved to `localStorage.jobpilot_token`.

2. **Content script detects the token** (on web app pages) and sends `SYNC_AUTH_TOKEN` to the background service worker:
   ```js
   chrome.runtime.sendMessage({ action: 'SYNC_AUTH_TOKEN', token, apiBaseUrl });
   ```

3. **Background stores the token** in `chrome.storage.local` (with in-memory `Map` fallback), along with expiry (`TOKEN_EXPIRY_KEY`) and API base URL (`API_BASE_URL_KEY`).

4. **Popup reads storage** on open: if token exists and is not expired → user is authenticated.

5. **User clicks "Save to JobPilot"** → popup sends `SAVE_JOB` to background → background calls `POST /api/jobs` with `Authorization: Bearer <token>`.

6. **401 handling**: if the API returns 401, background:
   - Removes expired token from storage
   - Queries open JobPilot tabs via `chrome.tabs.query`
   - Sends `REQUEST_TOKEN_SYNC` to each tab
   - Gets fresh token → retries the save once

7. **No token**: if no token exists at all, popup shows "Sign in to JobPilot" button → opens `WEB_APP_URL /login` in a new tab.

### Token Validation

- JWT `exp` claim is checked on every storage read.
- A hard 7-day TTL is enforced from `iat` claim (`MAX_TOKEN_TTL_DAYS`).
- `chrome.storage.onChanged` listener syncs updates to the in-memory fallback.
- An hourly `setInterval` (`3600000` ms) runs cleanup for stale tokens.

---

## Content Script Deep-Dive

File: `extension/content.js` (847 lines)

### IIFE Pattern

The entire script is wrapped in an IIFE to avoid polluting the global namespace:

```js
(function () { 'use strict'; /* ... */ })();
```

### Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_TEXT_LENGTH` | 50000 | Max characters for any extracted text field |
| `MAX_DESC_LENGTH` | 500 | Max characters for job description |
| `FETCH_TIMEOUT_MS` | 10000 | AbortController timeout for fetch requests |
| `FETCH_RETRIES` | 3 | Number of retry attempts on fetch failure |

### DOM Cloning

The script clones the entire document to detach from the live DOM, preventing layout thrashing and mutation observer interference:

```js
var doc = document.cloneNode(true);
```

All selectors operate on this detached clone.

### Helper Functions

| Function | Purpose |
|----------|---------|
| `clean(str)` | Trims whitespace and collapses multiple spaces |
| `safeDecode(str)` | `decodeURIComponent` in try-catch (returns original on failure) |
| `qs(doc, sel)` | `querySelector` in try-catch |
| `qsa(doc, sel)` | `querySelectorAll` → `Array.from` in try-catch |
| `attr(el, name)` | Safe `getAttribute` access |
| `text(el, max)` | Extracts `innerText`/`textContent`, capped to `max` |
| `firstText(doc, selectors)` | Returns text from first matching selector |
| `firstAttr(doc, selectors, attr)` | Returns attribute from first matching selector |
| `findMeta(doc, prop)` | Reads `<meta property>` or `<meta name>` content |
| `titleFromUrl()` | Extracts job title from URL path segments |

All `text()` calls are capped at `MAX_TEXT_LENGTH` (50000) to prevent memory issues.

### LD+JSON Strategy

The primary extraction method parses `<script type="application/ld+json">` elements:

1. Collects all LD+JSON script tags
2. Parses each with `JSON.parse`
3. Handles `@graph` wrappers (used by LinkedIn, Google Jobs, etc.) by flattening the graph array
4. Checks `@type` for `JobPosting` (supports array types)
5. Extracts all fields from the schema.org structure
6. If description is short (< 20 chars) after LD+JSON, falls back to DOM selectors for a better description
7. If no skills extracted, runs `extractSkillsFromDescription` on the description

### Board-Specific Selectors

The script has dedicated extractors for major boards. Each returns `null` if the hostname doesn't match:

| Extractor | Boards | Selectors (approx.) |
|-----------|--------|---------------------|
| `extractLinkedIn` | linkedin.com | 15+ (title, company, bullets, workplace, salary, description, apply) |
| `extractIndeed` | indeed.com, indeed.* | 15+ (title, company, location, salary, description, apply) |
| `extractGlassdoor` | glassdoor.com, glassdoor.* | 12+ (title, company, location, salary, description, apply) |
| `extractNaukri` | naukri.com | 10+ (title, company, location, salary, description, apply) |
| `extractMonster` | monster.com, foundit.* | 10+ (title, company, location, salary, description) |

### Generic Fallback Selectors

When no board-specific extractor matches and no LD+JSON/microdata is found, the generic extractor tries:

- **Title**: 12 selectors + `og:title`/`twitter:title` meta + URL-based extraction
- **Company**: 10 selectors (including `[itemprop="hiringOrganization"]`)
- **Location**: 9 selectors (including `[itemprop="addressLocality"]`)
- **Salary**: 10 selectors (including `[itemprop="baseSalary"]`)
- **Description**: 13 selectors (including `article`, `[role="main"]`, `#job-description`)
- **Original apply link**: 6 selectors

### Text-Based Detection

- `detectWorkModeFromString` / `detectWorkModeFromText` — keyword matching for "remote", "hybrid", "on-site"
- `detectJobTypeFromText` — keyword matching for "full-time", "part-time", "contract", "temporary", "internship", "freelance", "volunteer"
- `extractSkillsFromDescription` — compares description against a curated list of 40+ common tech skills
- `extractCompanyFromText` — regex patterns for "at/for/with [Company] is hiring"
- `extractLocationFromText` — regex patterns for "location: [City, State]"

### Fetch with Retry

Used for auth sync and is shared with the background service worker:

```js
function fetchWithRetry(url, options, retries, timeoutMs)
```

- Creates new `AbortController` per attempt
- 10-second timeout per attempt (configurable via `FETCH_TIMEOUT_MS`)
- Up to 3 retries (configurable via `FETCH_RETRIES`)
- Exponential backoff: 1s, 2s, 4s between retries
- Clears timeout on completion or error

### Storage Safety

All `chrome.storage.local` calls are wrapped in try-catch with an in-memory `Map` fallback:

```js
var memoryStorage = new Map();
function safeStorageGet(keys) { ... }
function safeStorageSet(items) { ... }
```

This ensures the extension works in private/incognito mode where `chrome.storage` may throw.

### Auth Sync

- `isJobPilotApp()` — checks if current host is the Vercel app or localhost
- `getApiBaseUrl()` — returns `http://localhost:5051/api` for localhost, otherwise production Render URL
- `syncToken()` — reads `localStorage.jobpilot_token` and sends `SYNC_AUTH_TOKEN` to background
- Listens for `jobpilot:auth-updated` custom event and `storage` events for token changes

### Initialization

- On JobPilot app pages: syncs token immediately, listens for auth updates and storage events
- On job board pages: auto-scrapes on load via `requestIdleCallback` (falls back to `setTimeout` 200ms) and dispatches `jobpilot:scrape-complete` custom event with the extracted data

---

## Background Script Deep-Dive

File: `extension/background.js` (460 lines)

### JWT Enforcement

```js
function decodeJwt(token)     // Base64-decode payload
function isTokenExpired(token) // Check exp + enforce 7d TTL from iat
function getTokenExpiry(token) // Extract exp as milliseconds
```

- `isTokenExpired` returns `true` if `exp` has passed OR if `iat + 7 days` has passed (whichever is sooner)
- `getStoredToken()` auto-removes expired tokens from storage

### 401 Recovery

When `POST /api/jobs` returns 401:

```js
function handle401AndRetry(body, apiBaseUrl)
```

1. Removes the expired token from storage
2. Queries all open JobPilot app tabs via `chrome.tabs.query`
3. Sends `REQUEST_TOKEN_SYNC` to each tab
4. Waits for token to appear in storage (`getStoredToken`)
5. If fresh token obtained → retries the API call once
6. If no token → returns "Session expired" error to popup

### Save Job Flow

```
saveJob(payload)
  → getStoredToken()
    → if no token → requestTokenSync() → getStoredToken()
  → normalizeJobPayload(payload)
    → if no title → return error
  → getApiBaseUrl()
  → checkDuplicate() (if originalApplyLink exists)
    → GET /api/jobs?limit=1&originalApplyLink=<url>
    → if duplicate → return success with duplicate: true
  → doSaveJob(token, body, apiBaseUrl)
    → POST /api/jobs with Bearer token
    → if 401 → handle401AndRetry
    → return success/error
```

### Normalization

`normalizeJobPayload` cleans and truncates all fields:

| Field | Max Length |
|-------|-----------|
| title | 200 |
| company | 200 |
| location | 240 |
| description | 4000 |
| originalApplyLink | 1000 |
| source | 240 |
| salary | 200 |
| jobType | 100 |
| workMode | 100 |
| skills (each) | 120 |

### GET_STATUS Handler

Fetches auth status and job count:

1. Calls `getStoredToken()`
2. If token exists → `GET /api/jobs?limit=1` with Bearer token
3. Parses response for `data.total` (preferred) or `data.jobs.length`
4. Returns `{ authenticated: bool, jobCount: number, apiBaseUrl: string }`

### Periodic Cleanup

```js
setInterval(function () { getStoredToken(); }, 3600000);
```

Runs every hour to check for and remove expired tokens.

### Storage Change Sync

```js
chrome.storage.onChanged.addListener(function (changes, areaName) { ... });
```

Syncs `jobpilot_token`, `jobpilot_api_base_url`, and `jobpilot_token_exp` changes to the in-memory `Map` fallback, ensuring consistent reads even when `chrome.storage` is unavailable.

---

## Popup UI

File: `extension/popup.html` + `extension/popup.js`

### States

| State | Trigger | UI |
|-------|---------|-----|
| **Loading** | Popup opened | Spinner + "Analyzing page..." |
| **No Job** | Page is not a job posting | "No job detected on this page" + hint text |
| **Signed Out** | No valid token | "You're signed out" + "Sign in to JobPilot" button |
| **Authenticated + No Job** | Valid token, non-job page | Signed out section hidden, save section hidden |
| **Job Detected + Signed Out** | Job found, no token | Job card shown + signed out section + sign in button |
| **Job Detected + Authenticated** | Job found, valid token | Job card shown + "Save to JobPilot" button |
| **Saving** | User clicked save | Button disabled + spinner + "Saving..." |
| **Saved** | Save succeeded | Green card with checkmark + "View on Dashboard" button |
| **Duplicate** | Job already saved | Card shows "✓ Already saved" |
| **Error** | Save failed | Red error message + button re-enabled |

### Connection Status

A bar at the top of the popup shows:
- Green dot + job count when authenticated
- Red dot + "Not connected" when not authenticated

### Visual Specs

- Width: 380px
- Font: system-ui stack
- Primary color: `#2563eb` (blue)
- Success color: `#059669` (green)
- Error color: `#dc2626` (red)
- Card background: `#f8fafc` with `#e2e8f0` border
- Fade-in animation: 200ms ease

---

## Manifest Configuration

```json
{
  "manifest_version": 3,
  "name": "JobPilot Companion",
  "version": "1.0.0",
  "description": "Your AI Career Operating System directly in your browser...",
  "homepage_url": "https://jobpilot-client-chi.vercel.app",
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Alt+Shift+J",
        "mac": "Alt+Shift+J"
      },
      "description": "Open JobPilot Companion popup"
    }
  },
  "permissions": ["activeTab", "storage", "scripting"],
  "host_permissions": [
    "*://*.linkedin.com/*",
    "*://*.indeed.com/*",
    "*://*.wellfound.com/*",
    "*://*.greenhouse.io/*",
    "*://*.lever.co/*",
    "*://*.ashbyhq.com/*",
    "*://*.workday.com/*",
    "*://*.myworkdayjobs.com/*",
    "*://*.naukri.com/*",
    "*://*.internshala.com/*",
    "*://*.cutshort.io/*",
    "*://*.instahyre.com/*",
    "*://*.hirect.in/*",
    "*://*.apna.co/*",
    "*://*.timesjobs.com/*",
    "*://*.shine.com/*",
    "*://*.monster.com/*",
    "*://*.glassdoor.com/*",
    "*://*.turing.com/*",
    "*://*.foundit.in/*",
    "*://*.foundit.com/*",
    "*://*.ziprecruiter.com/*",
    "*://*.careerbuilder.com/*",
    "*://*.simplyhired.com/*",
    "*://*.dice.com/*",
    "*://*.upwork.com/*",
    "*://*.freelancer.com/*",
    "*://*.reed.co.uk/*",
    "*://*.totaljobs.com/*",
    "*://*.cv-library.co.uk/*",
    "*://*.stepstone.de/*",
    "*://*.seek.com.au/*",
    "*://*.jobstreet.com/*",
    "*://*.bayt.com/*",
    "*://*.grabjobs.co/*",
    "*://*.google.com/*",
    "*://localhost:*/*",
    "https://jobpilot-client-chi.vercel.app/*",
    "https://web-dev-journey-cnee.onrender.com/*"
  ]
}
```

### Permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access current tab for job scraping |
| `storage` | Persist auth token and API URL across sessions |
| `scripting` | Inject content script when needed (fallback) |

### Host Permissions (37 entries)

- **US/Global**: LinkedIn, Indeed, Wellfound, Greenhouse, Lever, Ashby, Workday, MyWorkdayJobs, Monster, Glassdoor, ZipRecruiter, CareerBuilder, SimplyHired, Dice, Upwork, Freelancer, Google
- **India**: Naukri, Internshala, Cutshort, Instahyre, Hirect, Apna, TimesJobs, Shine, Foundit (India + global)
- **Europe/UK**: Reed, TotalJobs, CV-Library, StepStone
- **Asia/Pacific/ME**: Seek, JobStreet, Bayt, GrabJobs
- **Internal**: localhost (all ports), Vercel app, Render API

### Content Script Matches

The content script is injected on all 37 host patterns automatically via `manifest.json` `content_scripts.matches`. The `scripting` permission serves as a fallback when injection fails.

### Content Security Policy

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

### Icons

| Size | File |
|------|------|
| 16×16 | `icons/icon16.png` |
| 48×48 | `icons/icon48.png` |
| 128×128 | `icons/icon128.png` |
| Vector | `icons/icon.svg` |

---

## Development Setup

### Load Unpacked

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` directory
5. Pin JobPilot Companion to the toolbar (puzzle icon → pin)

### Debugging

- **Popup**: Right-click the extension icon → **Inspect popup** (opens DevTools for the popup window)
- **Content script**: Open DevTools on any job board page → **Sources** tab → `content.js`
- **Background service worker**: `chrome://extensions` → find JobPilot → **Service Worker** link (opens DevTools for the background script)
- **Storage**: `chrome://extensions-internals` or use DevTools → **Application** → **Storage** → **Local Storage** / **Extension Storage**

### Hot Reload

After editing any extension file, click the refresh icon on the extension card at `chrome://extensions`. No build step is required — the extension runs directly from source.

### Testing with Local Backend

1. Start the backend: `cd backend && npm run dev` (default: `http://localhost:5051`)
2. Start the frontend: `cd frontend && npm run dev` (default: `http://localhost:3000`)
3. The content script auto-detects `localhost` as a JobPilot app domain
4. Extension popup reads `API_BASE_URL_KEY` from storage — ensure it points to `http://localhost:5051/api`

---

## Building for Production

### Creating a ZIP

```bash
cd extension
# Windows (PowerShell):
Compress-Archive -Path * -DestinationPath ../extension.zip
```

Or zip the `extension/` folder manually.

### Chrome Web Store Submission

1. Go to the [Chrome Developer Dashboard](https://chromewebstore.google.com/devconsole)
2. Click **New item** (or select existing)
3. Upload the ZIP
4. Fill in:
   - **Description**: Match the manifest `description` field
   - **Screenshots**: 1280×800 or 640×400 PNG (at least 1)
   - **Promotional tiles**: Small (440×280) + Large (920×680)
   - **Category**: Productivity
   - **Language**: English
5. Submit for review

### Notes

- Ensure `version` in `manifest.json` is incremented for each update
- The `homepage_url` should point to the live JobPilot frontend
- All permissions must be justified in the store listing (explain `activeTab` for scraping, `storage` for auth, `scripting` for fallback injection, and each host permission for its respective job board)

---

## Testing

### Fixture Server

A local fixture server at `frontend/tests/e2e/fixture-server.mjs` serves test pages for extension scraping:

- `http://127.0.0.1:4010/job-posting` — job page with LD+JSON, generic selectors
- `http://127.0.0.1:4010/job-posting-no-ldjson` — same page without LD+JSON
- `http://127.0.0.1:4010/not-a-job` — non-job page (Google Search)

### Running E2E Tests

```bash
cd frontend
npx playwright test tests/e2e/extension-popup.spec.ts
```

### Test Coverage (5 tests)

| Test | Description |
|------|-------------|
| Content script detection | Verifies fixture page renders expected job title |
| LD+JSON extraction | Verifies structured data is parsed correctly with all fields populated |
| 404 handling | Ensures unknown routes return 404 |
| No-job detection | Verifies non-job page does not trigger false positive |
| Fixture server health | Verifies `/api/health` endpoint works |

### Production Readiness (v1.0.1)

All 49 issues from the comprehensive code review have been addressed:

| Category | Fixed |
|----------|-------|
| SPA race condition | `waitForContent()` polls DOM up to 3s for job elements before scraping |
| SPA navigation | History API interception (`pushState`/`replaceState`) + `popstate` listener re-scrapes on URL change |
| Auth scope | `isJobPilotApp()` uses `endsWith('.vercel.app')` — works on preview/staging deploys |
| Service worker crash | `window.location.href` removed from `normalizeJobPayload` (ReferenceError in SW) |
| Description truncation | `MAX_DESC_LENGTH` raised from 500 → 4000 chars |
| LD+JSON fallback | Removed `article`/`main`/`[role="main"]` from description selectors (too broad) |
| Glassdoor brittle classes | All `.css-*` auto-generated selectors removed |
| Hostname checks | All `indexOf` → `endsWith` (LinkedIn, Indeed, Glassdoor, Naukri, Monster) |
| Google auto-injection | Removed from `content_scripts` (CWS rejection risk); stays in `host_permissions` |
| JWT truncation | Token storage limit raised 2000 → 5000 chars |
| Token cleanup | `setInterval` → `chrome.alarms` (service-worker-safe) |
| Auth server verification | Popup now verifies token with API on init (not just local expiry) |
| Save re-parse | Cached job data reused; `parseCurrentTab()` only called as fallback |
| Parse timeout | `sendWithTimeout()` aborts after 10s |
| Request dedup | In-flight `inflightSaves` map prevents duplicate POSTs |
| Safe storage | `chrome.storage.local.set()` properly awaited |
| Skills list | Expanded from ~40 → 120+ skills |
| LinkedIn skills | Dedicated skills section extraction added |
| Work mode false positives | Negation patterns prevent "no remote" false matches |
| Query string | `URLSearchParams` replaces manual `encodeURIComponent` + string concat |
| Promise chain types | `_ctx` sentinel property prevents mixed-type confusion |
| 401 retry | Now checks response body `success` field, not just HTTP status |
| HTTPS localhost | `requestTokenSync` now queries `https://localhost:*/*` too |
| Multi-location | `locations` array now splits on `,` or `;` |
| `memoryStore['delete']` | Cleaned up to `memoryStore.delete()` |
| Error state UI | New `#error-state` card with detail message |
| SVG icon fallback | `onerror` handler falls back to PNG |
| Button accessibility | `title` attributes on all action buttons |
| `minimum_chrome_version` | Added `"minimum_chrome_version": "92"` (chrome.scripting requires Chrome 92+) |
| `chrome.storage` async | `tryStorageSet`/`tryStorageRemove` now return proper Promise via callback |
| Monster name mismatch | `extractMonster` renamed to `extractMonsterOrFoundit` with doc comment |
| Manifest permissions | `alarms` permission added for service-worker-safe cleanup |

### Manual Verification

See [README.md](../README.md#extension) for the full manual verification checklist (9 steps covering popup states, auth, save, duplicate detection, and non-job pages).

---

## Security

- All `chrome.storage` calls wrapped in try-catch with in-memory `Map` fallback (works in incognito)
- All `localStorage` calls wrapped in try-catch
- `safeDecodeURIComponent` wrapped in try-catch
- Fetch with `AbortController` prevents hanging requests
- JWT enforcement: `exp` + hard 7-day TTL from `iat`
- 401 response triggers token removal and re-authentication
- CSP restricts extension pages to `script-src 'self'`
- DOM cloned before querying — no live DOM mutation interference
- All text extraction capped at fixed maximum lengths
