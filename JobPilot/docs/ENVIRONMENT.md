<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Environment Configuration & Security</h1>
  <p><em>Strict cryptographic boundaries and environmental orchestrations for JobPilot.</em></p>
</div>

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [The .env.example Template](#-the-envexample-template)
3. [Mandatory Security Variables](#-mandatory-security-variables)
4. [Backend Server Topology](#-backend-server-topology)
5. [AI & Traffic Governance](#-ai--traffic-governance)
6. [Frontend Client Configuration](#-frontend-client-configuration)
7. [Validation & Fatal Exceptions](#-validation--fatal-exceptions)
8. [Related Documentation](#-related-documentation)

---

## 🎯 Executive Summary

JobPilot strictly enforces configuration integrity at the moment of process instantiation. The backend utilizes `dotenv` injected through a highly rigid validation layer (`src/config/env.js`). This ensures the Express server **never** boots into a vulnerable state. 

> [!CAUTION]
> **Zero Trust Credential Management:** Never commit `.env` files to version control. They are strictly tracked by `.gitignore`. In production environments (Vercel, Render, AWS), these secrets must be injected directly into the platform's isolated secure-vault dashboards.

---

## 📝 The `.env.example` Template

To rapidly bootstrap a local development environment, copy the following boilerplate. You must replace the cryptographic secrets with your own high-entropy strings.

```env
# ==========================================
# 1. CORE SECURITY & DATABASE (REQUIRED)
# ==========================================
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/jobpilot
JWT_SECRET=super_secure_access_token_secret_must_be_32_chars!
JWT_REFRESH_SECRET=super_secure_refresh_token_secret_must_be_32_chars!
GROQ_API_KEY=gsk_your_groq_api_key_here

# ==========================================
# 2. SERVER & CORS (OPTIONAL - DEFAULTS USED)
# ==========================================
PORT=5051
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ==========================================
# 3. SMTP AUTOMATION (OPTIONAL)
# ==========================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_password
```

---

## 🔐 Mandatory Security Variables

If any of these four variables are omitted or malformed, the application will trigger a fatal `process.exit(1)`.

| Variable | Constraint | Architectural Purpose |
|----------|------------|-----------------------|
| `MONGO_URI` | **Required** | The explicit connection string to your MongoDB cluster. Dictates the core storage layer. |
| `JWT_SECRET` | **≥ 32 Chars** | Cryptographic HMAC secret for signing short-lived (15m) access tokens. Length prevents brute-force signature forging. |
| `JWT_REFRESH_SECRET` | **≥ 32 Chars** | Independent HMAC secret for long-lived (30d) refresh tokens. Kept separate from access secrets to limit the blast radius of a breach. |
| `GROQ_API_KEY` | **Required** | The authorization bearer token granting access to the Groq AI Inference Engine. |

---

## ⚙️ Backend Server Topology

### Network & Environment
| Variable | Default Fallback | Purpose |
|----------|------------------|---------|
| `PORT` | `5051` | The designated HTTP port for the Express daemon. |
| `NODE_ENV` | `development` | Setting this to `production` enables critical Express-level caching and disables verbose stack traces. |
| `FRONTEND_URL` | `http://localhost:3000` | Whitelists the primary frontend origin against strict CORS policies. |

### Cron & Background Automation
The backend hosts an autonomous `node-cron` worker that sweeps the database to dispatch email reminders.
| Variable | Default Fallback | Purpose |
|----------|------------------|---------|
| `DEFAULT_TIMEZONE` | `UTC` | An explicit IANA timezone string (e.g., `America/New_York`) to prevent execution drift. |
| `DEFAULT_REMINDER_HOUR` | `9` | The specific hour (0-23) the daily automated digest fires. |
| `REMINDER_BATCH_SIZE` | `25` | Caps concurrent email dispatches per worker tick, preventing heavy memory spikes. |

---

## 🛡️ AI & Traffic Governance

JobPilot ships with three heavily independent rate-limiting buckets. These protect against Layer 7 DDoS attacks, brute-force login attempts, and LLM financial quota exhaustion.

| Variable Bucket | Time Window | Max Threshold | Target Routes |
|-----------------|-------------|---------------|---------------|
| `API_RATE_LIMIT_MAX` | 15 Minutes | `250` Requests | All general `/api/*` endpoints. |
| `AUTH_RATE_LIMIT_MAX`| 10 Minutes | `12` Requests | Specifically guards `/login` and `/register`. |
| `AI_RATE_LIMIT_MAX` | 15 Minutes | `20` Requests | Strictly limits the costly `/api/ai/*` inference pipeline. |

---

## ⚛️ Frontend Client Configuration

The Next.js presentation layer requires variables to be prefixed with `NEXT_PUBLIC_` for Webpack to safely expose them to the browser environment. These are housed in `frontend/.env.local`.

| Variable | Requirement | Purpose |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | **Required** | The explicit Base URL for the Express API. **Do not include a trailing slash.** |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`| Optional | Your Google Cloud Console Client ID. Activates the Google One-Tap seamless authentication UI. |

---

## 🚨 Validation & Fatal Exceptions

JobPilot does not believe in silent failures. The `src/config/env.js` layer evaluates the runtime environment on boot. If a vulnerability is detected, the server throws one of the following fatal exceptions and aborts:

- `MONGO_URI is required`
- `JWT_SECRET must be at least 32 characters long` *(Enforced to mathematically neutralize dictionary and rainbow-table cracking).*
- `DEFAULT_TIMEZONE is invalid` *(Thrown if the string fails IANA database validation).*

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **Deployment Procedures** | [Deployment Guide](./deployment.md) |
| **Security Architecture** | [Security Documentation](./security.md) |
| **Backend Integration** | [Backend System Details](./backend.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="./deployment.md">Deployment Guide →</a>
</div>
