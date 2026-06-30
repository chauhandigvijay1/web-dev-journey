# Phase 4: Extension Production Fixes

## Issues Found & Fixed

### 4.1 Content script runs on ALL sites (HIGH)
- **Problem**: `manifest.json` content_scripts matches `"<all_urls>"` - runs on every page the user visits
- **Fix**: Restricted to job board hostnames + extension's own domain (web app for token sync)
- **Files changed**: `extension/manifest.json`

### 4.2 No inline sign-in (CRITICAL for UX)
- **Problem**: Popup shows "Open JobPilot while signed in" if no token - user has to leave the job page, open web app, sign in, come back
- **Fix**: Added "Sign in with Google" button directly in the popup. Uses chrome.identity API to get OAuth token, registers via a lightweight API call, stores token, then saves the job. User never leaves the extension.
- **Files changed**: `extension/popup.html`, `extension/popup.js`, `extension/background.js`, `extension/manifest.json`

### 4.3 Popup always says "detected a job posting" (MEDIUM)
- **Problem**: Popup static text always says job detected, even on non-job pages. Confusing.
- **Fix**: Popup now tries PARSE_JOB on open, shows "No job detected on this page" if parsing returns empty. Only shows save button if a job title is found.
- **Files changed**: `extension/popup.js`, `extension/popup.html`

### 4.4 Save button has no loading state (LOW)
- **Problem**: User can click "Save" multiple times - sends duplicate requests
- **Fix**: Button is disabled while saving with "Saving..." text
- **Files changed**: `extension/popup.js`, `extension/popup.html`

### 4.5 No accessibility (LOW)
- **Problem**: Missing aria-labels, role attributes
- **Fix**: Added `role="status"` and `aria-live="polite"` to status messages
- **Files changed**: `extension/popup.html`
