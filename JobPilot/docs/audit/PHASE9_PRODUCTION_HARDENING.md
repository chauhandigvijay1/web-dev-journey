# Phase 9: Production Hardening

## Issues Fixed

### 9.1 Password change doesn't invalidate sessions (HIGH)
- **Problem**: `changePassword` saved the new password but didn't clear existing sessions. Old JWT tokens (7d TTL) remained valid after password change.
- **Fix**: 
  - Added `tokenVersion: { type: Number, default: 0 }` to User model
  - `generateAccessToken` and `generateRefreshToken` now accept and embed `tokenVersion`
  - `createAuthSession` passes `user.tokenVersion` into both tokens
  - Auth middleware (`protect`) checks `decoded.tokenVersion < user.tokenVersion` → 401 if stale
  - `changePassword` bumps `user.tokenVersion += 1` then calls `clearUserSession(user)`
  - `refreshUserSession` also checks tokenVersion match
- **Files changed**: `backend/src/models/User.js`, `backend/src/utils/jwt.js`, `backend/src/services/auth.service.js`, `backend/src/middleware/auth.middleware.js`, `backend/src/controllers/auth.controller.js`

### 9.2 SMTP config cached forever (MEDIUM)
- **Problem**: `getMailTransporter()` cached the nodemailer transporter in a module-level variable. Environment variable changes required a server restart.
- **Fix**: Removed module-level `transporter` variable. `getMailTransporter()` now calls `createTransporter()` every time. Removed `resetMailTransporter()` export. Updated test helper `database.js` to stop calling it.
- **Files changed**: `backend/src/services/mail.service.js`, `backend/tests/helpers/database.js`

### 9.3 Username generation loops 10K queries (HIGH)
- **Problem**: `ensureUniqueUsername` in `utils/auth.js` looped from `counter = 1` to `9999`, making an individual DB query per iteration to find an available suffix.
- **Fix**: After trying the candidate list, does a single `$regex` query to find all existing `base+N` usernames, loads into a `Set`, then iterates in-memory from 1 to 9999 using `Set.has()`. Falls back to timestamp-based `jp<base36-timestamp>` if 9999 suffixes exhausted.
- **Files changed**: `backend/src/utils/auth.js`

### 9.4 Jobs count fetches ALL jobs (MEDIUM)
- **Problem**: Frontend fetched the entire `/api/jobs` list just to display a count badge.
- **Fix**: Added `GET /api/jobs/count` route + controller. Returns `{ success: true, data: { count: N } }` with a single `countDocuments` query.
- **Files changed**: `backend/src/controllers/job.controller.js`, `backend/src/routes/job.routes.js`

## Verification
- **Backend tests**: 21/21 pass (5 files — new count endpoint integration test)
- **Frontend build**: Compiles clean (12 routes, no warnings)

## Commit
`cfb67ae` — "phase9: production hardening - tokenVersion, SMTP refresh, username opt, count endpoint"
