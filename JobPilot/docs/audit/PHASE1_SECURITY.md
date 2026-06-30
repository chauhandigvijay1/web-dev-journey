# Phase 1: Security Fixes

## Issues Found & Fixed

### 1.1 .env tracked in git (CRITICAL)
- **Problem**: `backend/.env` was committed to repo with production secrets
- **Fix**: `git rm --cached backend/.env`, added to `.gitignore`
- **Note**: User must rotate all secrets manually

### 1.2 SSRF in job-extraction (CRITICAL)
- **Problem**: `extractJobFieldsFromUrl` in `services/job-extraction/index.js` fetches any user-supplied URL with no IP restrictions
- **Fix**: Added `net.isIP()` + private IP blocklist + URL hostname validation before fetch
- **Files changed**: `backend/src/services/job-extraction/helpers.js`

### 1.3 XSS in contact LinkedIn URL (HIGH)
- **Problem**: `JobDetailView.tsx` renders `<a href={contact.linkedin}>` without protocol validation
- **Fix**: Added URL validation helper to ensure only `https://` links pass through
- **Files changed**: `frontend/components/job/JobDetailView.tsx`

### 1.4 Extension CSP missing (HIGH)
- **Problem**: `manifest.json` has no `content_security_policy` — any injected script runs freely
- **Fix**: Added restrictive CSP for extension_pages
- **Files changed**: `extension/manifest.json`

### 1.5 CORS accepts null origin (MEDIUM)
- **Problem**: `app.js` accepts `origin === "null"` in CORS callback
- **Fix**: Removed `null` origin acceptance
- **Files changed**: `backend/src/app.js`

### 1.6 JWT_REFRESH_SECRET fallback (MEDIUM)
- **Problem**: Falls back to JWT_SECRET if not set — weakens separation
- **Fix**: Made it a `requiredString` so process fails at startup if missing
- **Files changed**: `backend/src/config/env.js`
