# Phase 2: Backend Production Fixes

## Issues Found & Fixed

### 2.1 Pagination on GET /api/jobs (HIGH)
- **Problem**: Returns ALL jobs unbounded - user with 10K jobs timesouts
- **Fix**: Added `?page=1&limit=50` with default limit=50, max 200. Returns `{ data: { jobs, pagination: { page, limit, total, pages } } }`
- **Files changed**: `backend/src/services/job.service.js`, `backend/src/controllers/job.controller.js`

### 2.2 Uncaught service errors → 500 (HIGH)
- **Problem**: `createJob`, `updateJob`, `deleteJob` throw errors that global handler maps to 500 instead of 404/400
- **Fix**: Added error type checking in controller catch blocks, map known errors to correct status codes
- **Files changed**: `backend/src/controllers/job.controller.js`

### 2.3 TOCTOU race in registration (MEDIUM)
- **Problem**: Two concurrent same-email signups: second one gets 500 duplicate key error
- **Fix**: Added unique check with proper 409 handling before user creation
- **Files changed**: `backend/src/controllers/auth.controller.js`

### 2.4 AI routes rate limited (MEDIUM)
- **Problem**: No rate limiting on AI endpoints - user can exhaust Groq API quota
- **Fix**: Added dedicated rate limiter for AI routes (20 req / 15 min per user)
- **Files changed**: `backend/src/routes/ai.routes.js`

### 2.5 Health endpoint checks DB (MEDIUM)
- **Problem**: `/health` reports "API running" even when DB is disconnected
- **Fix**: Added mongoose.connection.readyState check
- **Files changed**: `backend/src/controllers/health.controller.js`

### 2.6 Auth refresh returns 401 instead of 200+success:false (LOW)
- **Problem**: When refresh token is missing/expired, endpoint returns 200 with `{success:false}` - confusing
- **Fix**: Changed to return 401 with proper error
- **Files changed**: `backend/src/controllers/auth.controller.js`
