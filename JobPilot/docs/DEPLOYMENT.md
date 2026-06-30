# Deployment Guide

## Architecture Overview

JobPilot consists of three independent components:

| Component | Stack | Hosting | Live URL |
|---|---|---|---|
| **Frontend** | Next.js 14 (React, TypeScript) | Vercel | https://jobpilot-client-chi.vercel.app |
| **Backend API** | Node.js + Express 5 (ESM) | Render | https://web-dev-journey-cnee.onrender.com |
| **Browser Extension** | Chrome MV3 (vanilla JS) | Chrome Web Store | Loaded unpacked during dev |

The frontend communicates with the backend via REST API calls. The extension injects content scripts into job board pages and sends extracted data to the backend.

---

## Prerequisites

- Node.js >= 18
- npm (comes with Node.js)
- Git
- A [Vercel](https://vercel.com) account (for frontend)
- A [Render](https://render.com) account (for backend)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Groq](https://groq.com) API key
- A Chrome/Chromium browser (for extension development)

---

## Frontend — Deploy to Vercel

**Root directory:** `JobPilot/frontend`

### Step-by-step

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New → Project**.
3. Import your GitHub repository.
4. In the **Configure Project** step:
   - **Root Directory:** Click **Edit** and set it to `frontend`.
   - **Framework Preset:** Select **Next.js** (Vercel auto-detects it).
   - **Build Command:** Leave as default (`next build`).
   - **Output Directory:** Leave as default (`.next`).
5. Add the required environment variable:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://web-dev-journey-cnee.onrender.com` |

   Optional: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (for Google One Tap sign-in).
6. Click **Deploy**.
7. Vercel assigns a `.vercel.app` domain. Configure a custom domain if desired.

> **Note:** The postbuild script (`node scripts/ensure-routes-manifest.mjs`) runs automatically after `next build` and verifies the routes manifest is correctly generated.

---

## Backend — Deploy to Render

**Root directory:** `JobPilot/backend`

### Step-by-step

1. Go to [render.com](https://render.com) and click **New → Web Service**.
2. Connect your GitHub repository.
3. Configure the service:

   | Setting | Value |
   |---|---|
   | **Name** | `jobpilot-api` (or your preference) |
   | **Root Directory** | `backend` |
   | **Runtime** | **Node** |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | Free or any paid tier |

4. Add all required environment variables:

   | Variable | Required | Example |
   |---|---|---|
   | `MONGO_URI` | Yes | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/jobpilot?retryWrites=true&w=majority` |
   | `JWT_SECRET` | Yes | A random string ≥ 32 characters |
   | `JWT_REFRESH_SECRET` | Yes | A different random string ≥ 32 characters |
   | `GROQ_API_KEY` | Yes | `gsk_xxxxxxxxxxxxxxxx` |

   Add any optional variables as needed (see [ENVIRONMENT.md](./ENVIRONMENT.md) for the full list).
5. Click **Create Web Service**.
6. Render provisions the service and starts it. Monitor the logs for any startup errors.

---

## Extension — Packaging & Distribution

### Load Unpacked (Development)

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (toggle in top-right).
3. Click **Load unpacked**.
4. Select `JobPilot/extension/`.
5. The extension icon appears in the toolbar. Use `Alt+Shift+J` to open the popup.

### Package for Chrome Web Store

1. Increment the `"version"` field in `manifest.json`.
2. Create a ZIP archive of the `extension/` folder:

   ```powershell
   Compress-Archive -Path extension\* -DestinationPath jobpilot-extension-v1.0.0.zip
   ```

3. Upload to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
4. Fill in the store listing (description, screenshots, promo tiles, privacy policy URL).
5. Submit for review. Review typically takes 1–3 business days.

> **Note:** The extension requires 37 host permissions across major job boards. The review team may ask for justification — explain that each permission is needed for automatic job detection on that specific domain.

---

## Post-Deployment Verification Checklist

- [ ] Backend health check responds: `GET https://web-dev-journey-cnee.onrender.com/api/health`
- [ ] Frontend loads at the Vercel URL without console errors
- [ ] User registration and login work end-to-end
- [ ] Google One Tap sign-in works (if configured)
- [ ] Job creation, listing, and search work
- [ ] Job extraction from a public URL returns correct data
- [ ] Reminder email pipeline runs (check backend logs for scheduler output)
- [ ] Extension popup opens on a supported job board and extracts data
- [ ] Rate limiting is active (rapid requests return 429)

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---|---|---|
| Backend crashes on startup | Missing required env var (`MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GROQ_API_KEY`) | Check Render dashboard → Environment. Add the missing variable and redeploy. |
| Backend logs: `MongoDB connection failed` | Wrong `MONGO_URI` or Atlas IP whitelist | Verify the connection string. Add Render's IP range to Atlas Network Access (0.0.0.0/0 for free tier). |
| Frontend cannot reach backend | `NEXT_PUBLIC_API_URL` is wrong or CORS misconfigured | Verify the URL on Vercel. On Render, set `CORS_ORIGINS` to include the frontend URL. |
| Extension says "Not logged in" | Auth cookie domain mismatch | The extension sends cookies to the backend. Ensure `FRONTEND_URL` matches the extension's origin. |

---

## CI/CD Recommendations

### Vercel (Frontend)

Vercel automatically deploys every push to the production branch (usually `main` or `master`). Preview deployments are created for pull requests. To prevent broken deployments, configure:

- **GitHub Checks:** Enable Vercel's status checks so PRs cannot merge if the deployment fails.
- **Pre-deploy hook:** Run lint + tests before merge. Example GitHub Actions workflow step:

  ```yaml
  - name: Run frontend tests
    run: |
      cd frontend
      npm.cmd ci
      npm.cmd run lint
      npm.cmd test
  ```

### Render (Backend)

Render supports **Auto-Deploy** — every push to the branch triggers a new deployment. Recommended setup:

- Use a `staging` branch or separate Render service for staging.
- Enable **Auto-Deploy** only for the production service.
- Add a health check endpoint (`/api/health`) and configure Render's health check path.
- Use **Preview Environments** for pull requests (Render Pro plan).

### GitHub Actions (Recommended Pipeline)

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Backend tests
        run: |
          cd backend
          npm ci
          npm test
      - name: Frontend tests
        run: |
          cd frontend
          npm ci
          npm test
```
