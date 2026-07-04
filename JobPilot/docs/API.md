<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>API Reference Guide</h1>
  <p><em>The core RESTful interface powering the JobPilot ecosystem.</em></p>
</div>

---

## 📑 Table of Contents

1. [Platform Overview](#-platform-overview)
2. [Authentication Protocol](#-authentication-protocol)
3. [Global Constraints](#-global-constraints)
4. [Endpoint Reference](#-endpoint-reference)
    - [Health Check](#health-check)
    - [Authentication](#authentication)
    - [Job Management](#job-management)
    - [AI Orchestration](#ai-orchestration)
    - [Career Brain](#career-brain)
    - [Uploads](#uploads)
5. [Enumerations](#-enumerations)
6. [Related Documentation](#-related-documentation)

---

## 🌐 Platform Overview

JobPilot exposes a strictly RESTful API handling authentication, job tracking, and high-performance AI inference. 

**Base URLs**
| Environment | URL |
|-------------|-----|
| **Production** | `https://web-dev-journey-cnee.onrender.com/api` |
| **Development**| `http://localhost:5051/api` |

> [!TIP]
> **Data Types:** All endpoints expect and return `application/json` unless dealing with specific multipart forms (like PDF/Image uploads).

---

## 🔐 Authentication Protocol

JobPilot implements a **Dual JWT Strategy**. All protected endpoints require a valid Access Token.

### 1. Access Token
Must be passed in the Authorization header. **TTL: 15 minutes.**
```http
Authorization: Bearer <access_token>
```

### 2. Refresh Token
Passed securely via an `httpOnly`, `Secure`, `SameSite=Lax` cookie named `jobpilot_refresh`. It is exchanged at the `POST /api/auth/refresh` endpoint when an access token expires. **TTL: 30 days.**

> [!IMPORTANT]
> **Instant Session Revocation:** Changing your password increments your internal `tokenVersion`. This action immediately invalidates all active sessions globally without requiring a centralized redis blacklist.

---

## 🚦 Global Constraints

### Rate Limiting
To prevent abuse, boundaries are strictly enforced per IP.

| Scope | Window | Max Requests | Affected Routes |
|-------|--------|--------------|-----------------|
| **Global API** | 15 Minutes | 250 | All `/api/*` routes |
| **Authentication** | 10 Minutes | 12 | `/api/auth/register`, `/login`, `/google` |
| **AI Inference** | 15 Minutes | 20 | All `/api/ai/*` endpoints |

### Standard Response Format
Every response adheres to a strict standardized structure to simplify client parsing.

```json
{
  "success": true, // or false on error
  "message": "Human-readable context",
  "data": { ... } // Omitted on error
}
```

### Pagination
List endpoints (like `GET /api/jobs`) utilize offset pagination. Append `?page=1&limit=50` to the query string.

---

## 🚀 Endpoint Reference

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Ping the server to verify MongoDB connection and uptime. |

---

### Authentication

| Method | Endpoint | Rate Limited | Description |
|--------|----------|--------------|-------------|
| `POST` | `/api/auth/register` | Yes (12/10m) | Creates a new user profile. |
| `POST` | `/api/auth/login` | Yes (12/10m) | Authenticates via email/username and password. |
| `POST` | `/api/auth/google` | Yes (12/10m) | Handles Google OAuth One-Tap sign-ins. |
| `POST` | `/api/auth/refresh` | No | Exchanges the httpOnly refresh cookie for a new JWT pair. |
| `POST` | `/api/auth/logout` | No | Clears the session cookie. |
| `GET` | `/api/auth/me` | Yes | Retrieves the authenticated user's profile and settings. |
| `PATCH`| `/api/auth/me` | Yes | Updates profile fields and nested settings. |
| `POST` | `/api/auth/change-password` | Yes | Updates the password and invalidates all existing sessions. |

<details>
<summary><strong>Example Payload: Registration</strong></summary>

```json
{
  "name": "Jane Smith",
  "username": "janesmith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "timezone": "America/New_York"
}
```
</details>

---

### Job Management

All job endpoints are protected and require a Bearer token.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs` | Retrieves a paginated list of the user's jobs. |
| `POST` | `/api/jobs` | Creates a new manual job entry. |
| `GET` | `/api/jobs/count` | Returns integer representing total saved jobs. |
| `POST` | `/api/jobs/extract` | Extracts job metadata from a provided URL (SSRF hardened). |
| `GET` | `/api/jobs/:id` | Retrieves deep details for a specific job. |
| `PATCH`| `/api/jobs/:id` | Updates specific fields of a job. |
| `DELETE`| `/api/jobs/:id` | Archives/Deletes a specific job. |
| `DELETE`| `/api/jobs` | Purges all jobs (Irreversible). |

<details>
<summary><strong>Example Payload: Create Job</strong></summary>

```json
{
  "title": "Senior Frontend Engineer",
  "company": "Acme Corp",
  "location": "San Francisco, CA",
  "jobType": "Full-time",
  "status": "saved",
  "workMode": "Remote",
  "skills": ["React", "TypeScript"]
}
```
</details>

---

### AI Orchestration

All AI routes are aggressively rate-limited (20 requests / 15 minutes) to protect Groq compute quotas.

| Method | Endpoint | Payload Required | Description |
|--------|----------|------------------|-------------|
| `POST` | `/api/ai/follow-up` | `{ title, company, notes }` | Drafts a personalized follow-up email. |
| `POST` | `/api/ai/interview-questions` | `{ jobId }` | Infers potential interview questions based on the JD. |
| `POST` | `/api/ai/summarize` | *(Job Context)* | Truncates massive job descriptions into 3-bullet summaries. |
| `POST` | `/api/ai/cover-letter` | *(Job Context)* | Generates a tailored cover letter. |
| `POST` | `/api/ai/ats-score` | `{ jobId }` | Cross-references user resume vs Job Description. |
| `POST` | `/api/ai/skill-gap` | `{ jobId }` | Identifies missing keywords on the user's resume. |

---

### Career Brain

The user's central AI intelligence hub.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/career-brain` | Retrieves parsed career profile data. |
| `POST` | `/api/career-brain/resume` | Ingests a new resume PDF/DOCX for AI extraction. |
| `PATCH`| `/api/career-brain` | Updates explicit career preferences. |
| `GET` | `/api/career-brain/download` | Exports the parsed profile structure. |

---

### Uploads

Handles multipart/form-data. Protected by strict magic-byte evaluation.

| Method | Endpoint | Constraints |
|--------|----------|-------------|
| `POST` | `/api/upload/resume` | `PDF` or `DOCX` only. Max 10MB. |
| `POST` | `/api/upload/profile-image` | `JPG`, `PNG`, `WEBP`, or `AVIF`. Max 5MB. |

---

## 🗂️ Enumerations

### Job Status
Used globally across the `Job` schema.
- `saved`: Discovered via extension, pre-application.
- `applied`: Resume submitted.
- `oa`: Online Assessment round scheduled.
- `interview`: Live rounds initiated.
- `offer`: Final negotiation phase.
- `rejected`: Closed pipeline.

### Contact Status
Used inside embedded contact sub-documents.
- `Contacted`
- `Replied`
- `Follow Up`
- `Interview Scheduled`
- `Closed`

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **Backend Implementation** | [Backend Engineering](./backend.md) |
| **Database Design** | [Database Architecture](./database.md) |
| **AI Workflows** | [Workflow Documentation](./workflow.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="./ai.md">AI Integration Guide →</a>
</div>
