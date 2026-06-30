# Environment Configuration Reference

## Overview

JobPilot uses environment variables for all configuration. The backend loads them at startup via `dotenv` with strict validation in `src/config/env.js`. The frontend uses Next.js's built-in `NEXT_PUBLIC_` convention for client-safe variables.

- **Backend:** Variables are read from the environment (`.env` file or platform environment on Render/Vercel). Required variables cause a startup crash if missing.
- **Frontend:** Public variables must be prefixed with `NEXT_PUBLIC_` and are baked into the JS bundle at build time.

---

## Backend Environment Variables

| Variable | Required | Description | Default | Example |
|---|---|---|---|---|
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string | — | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/jobpilot?retryWrites=true&w=majority` |
| `JWT_SECRET` | **Yes** | HMAC secret for access tokens (≥ 32 chars) | — | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `JWT_REFRESH_SECRET` | **Yes** | HMAC secret for refresh tokens (≥ 32 chars) | — | `p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1` |
| `GROQ_API_KEY` | **Yes** | Groq API key for AI-powered features | — | `gsk_xxxxxxxxxxxxxxxx` |
| `PORT` | No | HTTP listen port | `5051` | `8080` |
| `NODE_ENV` | No | Runtime environment | `development` | `production` |
| `FRONTEND_URL` | No | Frontend origin for CORS and redirects | `http://localhost:3000` (dev) / `https://jobpilot-client-chi.vercel.app` (prod) | `https://my-custom-domain.com` |
| `CORS_ORIGINS` | No | Comma-separated list of allowed CORS origins | Auto-derived from `FRONTEND_URL` + defaults | `http://localhost:3000,https://myapp.com` |
| `JWT_ACCESS_TTL` | No | Access token expiry duration | `7d` | `15m` |
| `JWT_REFRESH_TTL` | No | Refresh token expiry duration | `30d` | `60d` |
| `AUTH_COOKIE_NAME` | No | Name of the refresh token cookie | `jobpilot_refresh` | `my_app_refresh` |
| `DEFAULT_TIMEZONE` | No | Default timezone for reminders | `UTC` | `America/New_York` |
| `DEFAULT_REMINDER_HOUR` | No | Hour (0–23) for daily reminder digests | `9` | `10` |
| `REMINDER_CRON` | No | Cron expression for reminder scheduler | `*/10 * * * *` | `0 */2 * * *` |
| `REMINDER_LOCK_MINUTES` | No | Minutes to lock a reminder batch (prevent re-send) | `20` | `30` |
| `REMINDER_BATCH_SIZE` | No | Max reminders processed per scheduler tick | `25` | `50` |
| `REMINDER_RETRY_LIMIT` | No | Max retries for failed reminder sends | `3` | `5` |
| `REMINDER_SWEEP_SECRET` | No | Optional secret to trigger manual reminder sweep via API | — | `my-sweep-secret` |
| `API_RATE_LIMIT_WINDOW_MINUTES` | No | Rate limit window for general API routes | `15` | `10` |
| `API_RATE_LIMIT_MAX` | No | Max requests per window for general API | `250` | `500` |
| `AUTH_RATE_LIMIT_WINDOW_MINUTES` | No | Rate limit window for auth routes | `10` | `5` |
| `AUTH_RATE_LIMIT_MAX` | No | Max requests per window for auth | `12` | `20` |
| `AI_RATE_LIMIT_WINDOW_MINUTES` | No | Rate limit window for AI-powered routes | `15` | `30` |
| `AI_RATE_LIMIT_MAX` | No | Max requests per window for AI routes | `20` | `100` |
| `SMTP_HOST` | No | SMTP server hostname | — | `smtp.sendgrid.net` |
| `SMTP_PORT` | No | SMTP server port | `587` | `465` |
| `SMTP_SECURE` | No | Use TLS for SMTP | `false` | `true` |
| `SMTP_USER` | No | SMTP authentication username | — | `apikey` |
| `SMTP_PASS` | No | SMTP authentication password or API key | — | `SG.xxxxxxxxxx` |
| `EMAIL_FROM` | No | From address for outgoing emails | Falls back to `SMTP_FROM` → `SMTP_USER` | `noreply@jobpilot.app` |
| `TINYFISH_API_KEY` | No | Tinyfish API key (enhanced job enrichment) | — | `tf_xxxxxxxx` |

> **Note:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are read directly from `process.env` in `src/config/cloudinary.js` but are optional — Cloudinary is only used if all three are set.

---

## Frontend Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API base URL (must not end with `/`) | `https://web-dev-journey-cnee.onrender.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth client ID for One Tap sign-in | `1234567890-xxxxx.apps.googleusercontent.com` |

> **Important:** Only variables prefixed with `NEXT_PUBLIC_` are available in the browser. Do not expose secrets via `NEXT_PUBLIC_*` variables.

---

## Environment Validation Rules

The backend (`src/config/env.js`) enforces these rules at startup:

### Hard failures (process crashes with an error message)

| Rule | Error Message |
|---|---|
| `MONGO_URI` is missing | `MONGO_URI is required` |
| `JWT_SECRET` is missing | `JWT_SECRET is required` |
| `JWT_REFRESH_SECRET` is missing | `JWT_REFRESH_SECRET is required` |
| `GROQ_API_KEY` is missing | `GROQ_API_KEY is required` |
| `JWT_SECRET` < 32 characters | `JWT_SECRET must be at least 32 characters long` |
| `JWT_REFRESH_SECRET` < 32 characters | `JWT_REFRESH_SECRET must be at least 32 characters long` |
| `DEFAULT_TIMEZONE` is not a valid IANA timezone | `DEFAULT_TIMEZONE is invalid: <value>` |

### Soft defaults

All other variables default to a safe value when omitted. Numeric variables are clamped within defined min/max bounds. If a number cannot be parsed, the default is used silently.

> **Note:** `MONGO_URI` is validated at startup but does **not** cause a crash — the server logs a warning and continues without a database connection. The actual crash would happen at runtime when a route tries to use the database.

---

## `.env.example` File Structure

### Backend (`backend/.env.example`)

```env
# === Required ===
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/jobpilot
JWT_SECRET=your-access-secret-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars-long
GROQ_API_KEY=gsk_your_groq_api_key_here

# === Server ===
PORT=5051
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# === JWT ===
JWT_ACCESS_TTL=7d
JWT_REFRESH_TTL=30d
AUTH_COOKIE_NAME=jobpilot_refresh

# === Reminders ===
DEFAULT_TIMEZONE=UTC
DEFAULT_REMINDER_HOUR=9
REMINDER_CRON=*/10 * * * *
REMINDER_LOCK_MINUTES=20
REMINDER_BATCH_SIZE=25
REMINDER_RETRY_LIMIT=3
REMINDER_SWEEP_SECRET=

# === Rate Limiting ===
API_RATE_LIMIT_WINDOW_MINUTES=15
API_RATE_LIMIT_MAX=250
AUTH_RATE_LIMIT_WINDOW_MINUTES=10
AUTH_RATE_LIMIT_MAX=12
AI_RATE_LIMIT_WINDOW_MINUTES=15
AI_RATE_LIMIT_MAX=20

# === SMTP (optional — required for email reminders) ===
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@jobpilot.app

# === Optional Integrations ===
TINYFISH_API_KEY=
```

### Frontend (`frontend/.env.example`)

```env
# === Required ===
NEXT_PUBLIC_API_URL=http://localhost:5051

# === Optional ===
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

> **Note:** Neither file currently exists in the repository — create them from the templates above.

---

## Best Practices

1. **Never commit `.env` files.** Add `.env` to `.gitignore`. Only commit `.env.example` templates with placeholder values.
2. **Rotate secrets periodically.** Change `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `GROQ_API_KEY` every 90 days.
3. **Use platform environment variables** on Render and Vercel instead of `.env` files in production. Both platforms provide a UI for managing secrets.
4. **Keep `JWT_SECRET` and `JWT_REFRESH_SECRET` different.** Using separate secrets limits blast radius if one is compromised.
5. **Use strong secrets.** Generate with a cryptographically secure method:
   ```powershell
   # Generate a 32-char random string (PowerShell)
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % { [char]$_ })
   ```
6. **Set `NODE_ENV=production` on Render.** This enables Express production optimizations (trust proxy, etc.).
7. **Validate timezone values** before deploying — use the IANA Time Zone Database names (e.g., `America/New_York`, `Asia/Kolkata`).
8. **Restart the frontend build** after changing `NEXT_PUBLIC_*` variables on Vercel — these values are baked into the JS bundle at build time, not at runtime.
