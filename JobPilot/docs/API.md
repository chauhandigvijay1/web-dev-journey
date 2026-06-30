# JobPilot API Reference

**Base URL (Production):** `https://web-dev-journey-cnee.onrender.com/api`

**Base URL (Development):** `http://localhost:5051/api`

**Frontend App:** `https://jobpilot-client-chi.vercel.app`

## Authentication

The API uses a **dual JWT** strategy: short-lived access tokens (7 days) for API authorization and long-lived refresh tokens (30 days) stored in an httpOnly cookie for transparent rotation.

### Access Token

Include in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Access tokens are returned in the `token` field of auth success responses. The frontend stores them in `localStorage` and automatically attaches them via Axios interceptor.

### Refresh Token

Set as an httpOnly, Secure (in production), SameSite=Lax cookie named `jobpilot_refresh`. The frontend's Axios response interceptor automatically catches 401 responses and calls `POST /api/auth/refresh` to obtain a new access/refresh token pair before retrying the original request.

### Token Versioning

Each user document has a `tokenVersion` field. On password change, the version is incremented, immediately invalidating all outstanding sessions regardless of token expiry.

### Session Invalidation

- **Logout**: `POST /api/auth/logout` clears the refresh token hash from the database and clears the cookie.
- **Password change**: Bumps `tokenVersion`, hashes stored refresh token to empty — requires re-login.
- **Token expiry**: Access tokens expire after 7 days. The refresh endpoint (`POST /api/auth/refresh`) requires a valid, non-expired refresh token.

## Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

### HTTP Status Codes

| Code | Description                           |
|------|---------------------------------------|
| 200  | Success                               |
| 201  | Created                               |
| 400  | Validation error / bad request        |
| 401  | Unauthorized (missing/invalid token)  |
| 403  | CORS not allowed                      |
| 404  | Resource not found / route not found  |
| 409  | Conflict (duplicate email, username)  |
| 429  | Rate limited                          |
| 500  | Internal server error                 |
| 502  | Upload failed (Cloudinary error)      |
| 503  | Service unavailable (DB down, misconfig) |

## Rate Limiting

The API applies three independent rate limiters:

| Limiter            | Window    | Max Requests | Scope                    |
|--------------------|-----------|-------------|--------------------------|
| API (global)       | 15 min    | 250         | All `/api` routes        |
| Auth               | 10 min    | 12          | `/api/auth/register`, `/login`, `/google` |
| AI                 | 15 min    | 20          | All `/api/ai/*` endpoints|

Rate-limited requests return:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

with a `429` status code and standard `RateLimit-*` headers.

## Pagination

List endpoints use cursor-less offset pagination via query parameters:

| Param   | Type   | Default | Max  | Description               |
|---------|--------|---------|------|---------------------------|
| `page`  | number | 1       | —    | Page number (1-indexed)   |
| `limit` | number | 50      | 200  | Items per page            |

Response includes a `pagination` object:

```json
{
  "success": true,
  "data": {
    "jobs": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 142,
      "pages": 3
    }
  }
}
```

## Enumerations

### Job Status

| Value       | Description            |
|-------------|------------------------|
| `saved`     | Discovered, not yet applied |
| `applied`   | Application submitted  |
| `oa`        | Online assessment received |
| `interview` | Interview stage        |
| `offer`     | Offer received         |
| `rejected`  | Rejected               |

### Contact Status

| Value                 | Description                         |
|-----------------------|-------------------------------------|
| `Contacted`           | Initial outreach sent               |
| `Replied`             | Contact has responded               |
| `Follow Up`           | Follow-up needed/pending            |
| `Interview Scheduled` | Interview has been scheduled        |
| `Closed`              | Conversation ended (offer/reject)   |

---

# Endpoints

## Health

### GET /api/health

Check API and database connectivity.

**Auth required:** No

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "db": "connected",
    "uptime": 123456.78
  }
}
```

**Response `503`** (DB disconnected):

```json
{
  "success": false,
  "message": "Database not connected",
  "data": { "db": "disconnected" }
}
```

---

## Auth

### POST /api/auth/register

Create a new account.

**Auth required:** No

**Rate limited:** Yes (12/10min)

**Request body:**

```json
{
  "name": "Jane Smith",
  "username": "janesmith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "emailNotifications": true,
  "timezone": "America/New_York"
}
```

| Field                | Type    | Required | Description                              |
|----------------------|---------|----------|------------------------------------------|
| `name`               | string  | Yes      | Display name                             |
| `username`           | string  | Yes      | 3–30 chars, letters/numbers/dots/dashes/underscores |
| `email`              | string  | Yes      | Valid email address                      |
| `password`           | string  | Yes      | Min 8 chars, uppercase, lowercase, number |
| `emailNotifications` | boolean | No       | Default `true`                           |
| `timezone`           | string  | No       | IANA timezone (e.g. `America/New_York`)  |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "665a1b2c3d4e5f6a7b8c9d0e",
      "name": "Jane Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "profilePic": "",
      "phone": "",
      "bio": "",
      "emailNotifications": true,
      "authProviders": { "password": true, "google": false },
      "settings": {
        "jobPreferences": { "preferredJobType": "", "preferredLocation": "", "expectedSalaryRange": "" },
        "productivity": { "defaultFollowUpDays": 5, "autoMarkGhostedDays": 21 },
        "notifications": { "timezone": "America/New_York", "reminderHour": 9, "weeklySummaryEnabled": false }
      },
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

**Set-Cookie:** `jobpilot_refresh=<token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`

**Status codes:** `201` Created, `400` Validation error, `409` Conflict (email/username taken)

---

### POST /api/auth/login

Authenticate with email or username and password.

**Auth required:** No

**Rate limited:** Yes (12/10min)

**Request body:**

```json
{
  "identifier": "jane@example.com",
  "password": "SecurePass123!"
}
```

| Field        | Type   | Required | Description                        |
|--------------|--------|----------|------------------------------------|
| `identifier` | string | Yes      | Email or username                  |
| `email`      | string | Alt      | Alternative to `identifier`        |
| `username`   | string | Alt      | Alternative to `identifier`        |
| `password`   | string | Yes      | Account password                   |

**Response `200`:** Same schema as register (with `token` and `user`).

**Status codes:** `200` OK, `400` Validation error, `401` Invalid credentials

---

### POST /api/auth/google

Authenticate or register via Google OAuth credential.

**Auth required:** No

**Rate limited:** Yes (12/10min)

**Request body:**

```json
{
  "credential": "google_id_token_string",
  "timezone": "Asia/Kolkata"
}
```

| Field        | Type   | Required | Description                              |
|--------------|--------|----------|------------------------------------------|
| `credential` | string | Yes      | Google ID token from the OAuth client    |
| `timezone`   | string | No       | IANA timezone                            |

**Behavior:** If the email already exists (via password or another Google ID), it links the Google account. If the Google ID already exists, it logs in. Otherwise, it creates a new user with `hasPassword: false`.

**Response `200`/`201`:** Same auth schema as register.

**Status codes:** `200` Login, `201` New account created, `400` Validation error, `401` Invalid credential, `409` Email linked to different Google account, `503` Google sign-in not configured

---

### POST /api/auth/refresh

Exchange a valid refresh token (from cookie) for a new access + refresh token pair (token rotation).

**Auth required:** No (relies on httpOnly cookie)

**Request body:** None (reads `jobpilot_refresh` cookie)

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

**Set-Cookie:** New `jobpilot_refresh` cookie.

**Status codes:** `200` OK, `401` Refresh session not found/invalid

---

### POST /api/auth/logout

Clear the current session. Best-effort — invalidates the stored refresh token hash.

**Auth required:** No (reads cookie)

**Request body:** None

**Response `200`:**

```json
{
  "success": true,
  "message": "Logged out"
}
```

**Set-Cookie:** Clears `jobpilot_refresh` cookie.

---

### GET /api/auth/me

Get the authenticated user's profile.

**Auth required:** Yes (Bearer token)

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "665a1b2c3d4e5f6a7b8c9d0e",
      "name": "Jane Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "profilePic": "https://...",
      "phone": "+1234567890",
      "bio": "Software engineer...",
      "emailNotifications": true,
      "authProviders": { "password": true, "google": true },
      "settings": { ... },
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

**Status codes:** `200` OK, `401` Unauthorized

---

### PATCH /api/auth/me

Update the authenticated user's profile. Only provided fields are updated; all fields are optional but at least one must be present.

**Auth required:** Yes (Bearer token)

**Request body:**

```json
{
  "name": "Jane Doe",
  "phone": "+1234567890",
  "bio": "Full-stack developer passionate about React and Node.js",
  "profilePic": "https://example.com/avatar.jpg",
  "emailNotifications": true,
  "settings": {
    "jobPreferences": {
      "preferredJobType": "Full-time",
      "preferredLocation": "San Francisco, CA",
      "expectedSalaryRange": "120k-160k"
    },
    "productivity": {
      "defaultFollowUpDays": 7,
      "autoMarkGhostedDays": 14
    },
    "notifications": {
      "timezone": "America/Los_Angeles",
      "reminderHour": 10,
      "weeklySummaryEnabled": true
    }
  }
}
```

| Field                        | Type    | Required | Description                      |
|----------------------------- |---------|----------|----------------------------------|
| `name`                       | string  | No       | Display name                    |
| `phone`                      | string  | No       | Max 32 chars                    |
| `bio`                        | string  | No       | Max 280 chars                   |
| `profilePic`                 | string  | No       | Valid HTTP(S) URL               |
| `emailNotifications`         | boolean | No       | Master toggle for email reminders |
| `settings.jobPreferences`    | object  | No       | Job search preferences          |
| `settings.productivity`      | object  | No       | Follow-up/ghosting defaults     |
| `settings.notifications`     | object  | No       | Timezone, reminder hour, weekly summary |

**Response `200`:** Updated user object.

**Status codes:** `200` OK, `400` Validation error / no changes, `401` Unauthorized

---

### POST /api/auth/change-password

Change password. Increments `tokenVersion`, invalidating all other sessions.

**Auth required:** Yes (Bearer token)

**Request body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

| Field             | Type   | Required | Description               |
|-------------------|--------|----------|---------------------------|
| `currentPassword` | string | Yes      | Current account password  |
| `newPassword`     | string | Yes      | Min 8 chars, mixed case, number |

**Response `200`:**

```json
{
  "success": true,
  "message": "Password updated. Please sign in again."
}
```

**Status codes:** `200` OK, `400` Validation error / same password / no password sign-in, `401` Incorrect current password, `404` User not found

---

## Jobs

All job endpoints require authentication (`protect` middleware). Prefix: `/api/jobs`.

### POST /api/jobs

Create a new job application.

**Auth required:** Yes

**Request body:**

```json
{
  "title": "Senior Frontend Engineer",
  "company": "Acme Corp",
  "location": "San Francisco, CA",
  "locations": ["San Francisco, CA", "Remote"],
  "jobType": "Full-time",
  "salary": "$150k - $180k",
  "experience": "5+ years",
  "source": "linkedin.com",
  "status": "saved",
  "workMode": "Remote",
  "descriptionSummary": "Building the next-gen dashboard...",
  "originalApplyLink": "https://linkedin.com/jobs/view/123",
  "notes": "Referred by John from internal team",
  "skills": ["React", "TypeScript", "Node.js"],
  "contacts": [
    {
      "name": "Sarah Recruiter",
      "role": "Technical Recruiter",
      "email": "sarah@acme.com",
      "linkedin": "https://linkedin.com/in/sarah",
      "status": "Contacted",
      "lastContactDate": "2025-06-01T00:00:00.000Z"
    }
  ],
  "followUpDate": "2025-06-15T00:00:00.000Z",
  "isPinned": false,
  "isImportant": true,
  "priorityScore": 85,
  "resumeUrl": "https://res.cloudinary.com/.../resume.pdf"
}
```

| Field                | Type    | Required | Default  | Description                          |
|----------------------|---------|----------|----------|--------------------------------------|
| `title`              | string  | Yes      | —        | Job title                            |
| `company`            | string  | No       | `""`     | Company name                         |
| `location`           | string  | No       | `""`     | Primary location                     |
| `locations`          | string[]| No       | `[]`     | Alternative locations                |
| `jobType`            | string  | No       | `""`     | Full-time, Part-time, Contract, etc. |
| `salary`             | string  | No       | `""`     | Salary range (free text)             |
| `experience`         | string  | No       | `""`     | Required experience                  |
| `source`             | string  | No       | `""`     | Source domain (e.g., linkedin.com)   |
| `status`             | string  | No       | `saved`  | One of: `saved`, `applied`, `oa`, `interview`, `offer`, `rejected` |
| `workMode`           | string  | No       | `""`     | Remote, Hybrid, On-site             |
| `descriptionSummary`  | string  | No       | `""`     | Short job description                |
| `originalApplyLink`  | string  | No       | `""`     | URL to original job posting          |
| `notes`              | string  | No       | `""`     | Personal notes                       |
| `skills`             | string[]| No       | `[]`     | Required skills                      |
| `contacts`           | array   | No       | `[]`     | Array of contact objects             |
| `followUpDate`       | string  | No       | `null`   | ISO 8601 date                        |
| `isPinned`           | boolean | No       | `false`  | Pin to top of board                  |
| `isImportant`        | boolean | No       | `false`  | Mark as important                    |
| `priorityScore`      | number  | No       | `50`     | 0–100 priority score                 |
| `resumeUrl`          | string  | No       | `""`     | Uploaded resume URL                  |

**Contact object:**

| Field             | Type   | Required | Default       | Description                        |
|-------------------|--------|----------|---------------|------------------------------------|
| `name`            | string | Yes      | —             | Contact name                       |
| `role`            | string | No       | `"Recruiter"` | Contact role/title                 |
| `email`           | string | No       | `""`          | Contact email                      |
| `linkedin`        | string | No       | `""`          | LinkedIn profile URL               |
| `status`          | string | No       | `"Contacted"` | One of: `Contacted`, `Replied`, `Follow Up`, `Interview Scheduled`, `Closed` |
| `lastContactDate` | string | No       | `Date.now()`  | ISO 8601 date                      |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "job": {
      "_id": "665a1b2c3d4e5f6a7b8c9d0e",
      "user": "665a1b2c3d4e5f6a7b8c9d0e",
      "title": "Senior Frontend Engineer",
      "company": "Acme Corp",
      "location": "San Francisco, CA",
      "locations": ["San Francisco, CA", "Remote"],
      "jobType": "Full-time",
      "salary": "$150k - $180k",
      "experience": "5+ years",
      "source": "linkedin.com",
      "status": "saved",
      "workMode": "Remote",
      "descriptionSummary": "Building the next-gen dashboard...",
      "originalApplyLink": "https://linkedin.com/jobs/view/123",
      "notes": "Referred by John from internal team",
      "skills": ["React", "TypeScript", "Node.js"],
      "contacts": [...],
      "followUpDate": "2025-06-15T00:00:00.000Z",
      "isPinned": false,
      "isImportant": true,
      "isGhosted": false,
      "priorityScore": 85,
      "resumeUrl": "https://res.cloudinary.com/.../resume.pdf",
      "reminderLastSentAt": null,
      "reminderLastSentForDate": "",
      "createdAt": "2025-06-10T12:00:00.000Z",
      "updatedAt": "2025-06-10T12:00:00.000Z"
    }
  }
}
```

**Status codes:** `201` Created, `400` Validation error, `401` Unauthorized

---

### GET /api/jobs

List all jobs for the authenticated user, paginated and sorted by newest first.

**Auth required:** Yes

**Query parameters:**

| Param   | Type   | Default | Description                        |
|---------|--------|---------|------------------------------------|
| `page`  | number | 1       | Page number (1-indexed)            |
| `limit` | number | 50      | Items per page (max 200)           |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "jobs": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 142,
      "pages": 3
    }
  }
}
```

**Status codes:** `200` OK, `401` Unauthorized, `500` Server error

---

### DELETE /api/jobs

Delete all jobs for the authenticated user. Irreversible.

**Auth required:** Yes

**Request body:** None

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "deletedCount": 142
  }
}
```

**Status codes:** `200` OK, `401` Unauthorized

---

### GET /api/jobs/count

Get the total number of jobs saved by the authenticated user.

**Auth required:** Yes

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "count": 142
  }
}
```

**Status codes:** `200` OK, `401` Unauthorized

---

### POST /api/jobs/extract

Extract job details from a URL. Uses Puppeteer/Cheerio-based extraction. SSRF protected.

**Auth required:** Yes

**Request body:**

```json
{
  "url": "https://linkedin.com/jobs/view/123456"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "title": "Senior Frontend Engineer",
    "company": "Acme Corp",
    "location": "San Francisco, CA",
    "salary": "$150k - $180k",
    "jobType": "Full-time",
    "workMode": "Remote",
    "description": "We are looking for...",
    "skills": ["React", "TypeScript"],
    "originalApplyLink": "https://linkedin.com/jobs/view/123456"
  }
}
```

**Status codes:** `200` OK, `400` Invalid URL / URL required, `401` Unauthorized

---

### GET /api/jobs/:id

Get a single job by ID.

**Auth required:** Yes

**Path parameters:**

| Param | Type   | Description        |
|-------|--------|--------------------|
| `id`  | string | MongoDB ObjectId   |

**Response `200`:** Same job object as creation response.

**Status codes:** `200` OK, `400` Invalid job id, `401` Unauthorized, `404` Job not found

---

### PUT /api/jobs/:id

### PATCH /api/jobs/:id

Full or partial update of a job. Both methods behave identically.

**Auth required:** Yes

**Path parameters:**

| Param | Type   | Description        |
|-------|--------|--------------------|
| `id`  | string | MongoDB ObjectId   |

**Request body:** Any subset of the job creation fields. Example (status update):

```json
{
  "status": "interview",
  "notes": "Phone screen scheduled for June 20"
}
```

**Response `200`:** Updated job object.

**Status codes:** `200` OK, `400` Validation error / bad request, `401` Unauthorized, `404` Job not found

---

### DELETE /api/jobs/:id

Delete a single job.

**Auth required:** Yes

**Path parameters:**

| Param | Type   | Description        |
|-------|--------|--------------------|
| `id`  | string | MongoDB ObjectId   |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Status codes:** `200` OK, `400` Invalid id, `401` Unauthorized, `404` Job not found

---

## AI

All AI endpoints are rate-limited at **20 requests per 15 minutes** and require authentication. Prefix: `/api/ai`.

### POST /api/ai/follow-up

Generate a professional follow-up email for a job application.

**Auth required:** Yes

**Rate limited:** Yes (20/15min)

**Request body:**

```json
{
  "title": "Senior Frontend Engineer",
  "company": "Acme Corp",
  "notes": "Had a great conversation with the hiring manager about their React migration"
}
```

| Field     | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `title`   | string | Yes      | Job title                      |
| `company` | string | No       | Company name                   |
| `notes`   | string | No       | Additional context for the email |

**Response `200`:**

```json
{
  "success": true,
  "data": "Hi [Recruiter Name],\n\nI wanted to follow up on my application..."
}
```

The `data` field contains the generated email body text.

**Status codes:** `200` OK, `400` Validation error, `401` Unauthorized, `429` Rate limited

---

### POST /api/ai/interview-questions

Generate company-specific interview preparation questions and strategies based on the job and the user's resume profile.

**Auth required:** Yes

**Rate limited:** Yes (20/15min)

**Request body:**

```json
{
  "jobId": "665a1b2c3d4e5f6a7b8c9d0e"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": "# Interview Preparation\n\n## Likely Interview Rounds\n..."
}
```

The `data` field contains markdown with sections: likely interview rounds, HR questions, role-specific technical questions, coding/case questions, company-focused signals, and positioning strategy.

**Status codes:** `200` OK, `400` Validation error, `401` Unauthorized, `404` Job not found, `429` Rate limited

---

### POST /api/ai/summarize

Generate a structured markdown summary of a job application.

**Auth required:** Yes

**Rate limited:** Yes (20/15min)

**Request body:**

```json
{
  "jobId": "665a1b2c3d4e5f6a7b8c9d0e"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": "## Overview\n\n**Role:** Senior Frontend Engineer at Acme Corp..."
}
```

**Status codes:** `200` OK, `400` Validation error, `401` Unauthorized, `404` Job not found, `429` Rate limited

---

### POST /api/ai/cover-letter

Generate a personalized cover letter for a specific job, leveraging the user's resume profile.

**Auth required:** Yes

**Rate limited:** Yes (20/15min)

**Request body:**

```json
{
  "jobId": "665a1b2c3d4e5f6a7b8c9d0e"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": "Dear Hiring Manager,\n\nI've been following Acme Corp's work in..."
}
```

**Status codes:** `200` OK, `400` Validation error, `401` Unauthorized, `404` Job not found, `429` Rate limited

---

### POST /api/ai/tailor-resume

Generate ATS-optimized resume tailoring suggestions for a specific job.

**Auth required:** Yes

**Rate limited:** Yes (20/15min)

**Request body:**

```json
{
  "jobId": "665a1b2c3d4e5f6a7b8c9d0e"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": "## Resume Tailoring Guide\n\n### New Summary\n..."
}
```

The response includes sections: new summary, keywords to inject, experience tweaks, and what to remove.

**Status codes:** `200` OK, `400` Validation error, `401` Unauthorized, `404` Job not found, `429` Rate limited

---

## Upload

All upload endpoints require authentication. Prefix: `/api/upload`.

### POST /api/upload/resume

Upload a resume file (PDF or DOCX) to Cloudinary.

**Auth required:** Yes

**Request:** `multipart/form-data`

| Field    | Type | Required | Description                      |
|----------|------|----------|----------------------------------|
| `resume` | file | Yes      | PDF or Word file (max 10 MB)     |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../resume.pdf"
  }
}
```

**Status codes:** `200` OK, `400` File too large / invalid type, `401` Unauthorized, `500` Cloudinary not configured, `502` Upload failed

---

### POST /api/upload/profile-image

Upload a profile image (JPG, PNG, WEBP, AVIF) to Cloudinary.

**Auth required:** Yes

**Request:** `multipart/form-data`

| Field   | Type | Required | Description                       |
|---------|------|----------|-----------------------------------|
| `image` | file | Yes      | Image file (max 5 MB)             |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../avatar.jpg"
  }
}
```

**Status codes:** `200` OK, `400` File too large / invalid type, `401` Unauthorized, `500` Cloudinary not configured, `502` Upload failed

---

## Career Brain

All career brain endpoints require authentication. Prefix: `/api/career-brain`.

### GET /api/career-brain

Get the user's resume profile (parsed data from uploaded resume).

**Auth required:** Yes

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "careerBrain": {
      "_id": "...",
      "user": "...",
      "parsedData": {
        "summary": "...",
        "skills": ["React", "Node.js"],
        "experience": [...],
        "techStack": [...],
        "careerGoals": "..."
      },
      "resumeUrl": "https://res.cloudinary.com/...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Status codes:** `200` OK, `401` Unauthorized

---

### POST /api/career-brain/resume

Upload a resume to be parsed and stored as the user's career brain profile.

**Auth required:** Yes

**Request:** `multipart/form-data`

| Field    | Type | Required | Description                  |
|----------|------|----------|------------------------------|
| `resume` | file | Yes      | PDF or Word file (max 10 MB) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "careerBrain": { ... }
  }
}
```

**Status codes:** `200` OK, `400` Validation error, `401` Unauthorized

---

### PATCH /api/career-brain

Update the career brain profile with manual edits.

**Auth required:** Yes

**Request body:**

```json
{
  "parsedData": {
    "summary": "Senior full-stack engineer with 7+ years...",
    "careerGoals": "Looking for Staff Engineer role..."
  }
}
```

**Response `200`:** Updated career brain object.

**Status codes:** `200` OK, `400` Validation error, `401` Unauthorized

---

## System

System endpoints are protected by a shared secret header (`x-reminder-secret`). Prefix: `/api/system`.

### POST /api/system/reminders/sweep

Manually trigger a reminder sweep. Useful for debugging or immediate delivery.

**Auth required:** Yes (header `x-reminder-secret`)

**Request headers:**

```
x-reminder-secret: <REMINDER_SWEEP_SECRET>
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "processed": 12,
    "sent": 5,
    "skipped": 6,
    "failed": 1
  }
}
```

**Status codes:** `200` OK, `401` Not authorized, `503` Secret not configured

---

### GET /api/system/mail/outbox

Read the debug mail outbox (if available).

**Auth required:** Yes (header `x-reminder-secret`)

**Request headers:**

```
x-reminder-secret: <REMINDER_SWEEP_SECRET>
```

**Status codes:** `200` OK, `401` Not authorized, `503` Secret not configured
