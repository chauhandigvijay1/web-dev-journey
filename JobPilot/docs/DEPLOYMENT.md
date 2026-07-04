# Deployment Guide

<p align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="120" />
</p>

> **JobPilot Deployment:** Comprehensive guide for deploying the Web App, Backend API, and Chrome Extension.

## Table of Contents

- [Overview](#overview)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Render)](#backend-deployment-render)
- [Extension Distribution](#extension-distribution)
- [Post-Deployment Verification](#post-deployment-verification)
- [CI/CD Recommendations](#cicd-recommendations)
- [Troubleshooting](#troubleshooting)
- [Related Documents](#related-documents)

---

## Overview

JobPilot is engineered for modern cloud infrastructure, mapping seamlessly to specialized platforms to optimize for latency, scale, and cost.

| Component | Stack | Hosting | Domain |
|-----------|-------|---------|----------|
| **Frontend** | Next.js 14 | Vercel | `jobpilot-client-chi.vercel.app` |
| **Backend API** | Express 5 | Render | `web-dev-journey-cnee.onrender.com` |
| **Extension** | Chrome MV3 | Web Store | — |

---

## Frontend Deployment (Vercel)

Vercel is the optimal hosting platform for Next.js applications, providing edge caching, global CDN distribution, and automated CI/CD.

### Steps to Deploy:
1. Ensure your latest changes are pushed to your target branch on GitHub.
2. From the Vercel dashboard, click **Add New** → **Project** and import the repository.
3. Configure the Root Directory to `frontend`.
4. Add the following Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://web-dev-journey-cnee.onrender.com`
5. Click **Deploy**. Vercel will automatically assign a `.vercel.app` domain.

> [!NOTE]
> Vercel automatically maps Next.js API Routes to serverless functions. Ensure your `NEXT_PUBLIC_API_URL` points directly to the Render backend, skipping Next.js API route proxies for backend calls unless strictly necessary.

---

## Backend Deployment (Render)

The Express backend demands a robust Node environment, which Render provides natively as a Web Service.

### Steps to Deploy:
1. Navigate to the Render dashboard, click **New** → **Web Service**, and link your GitHub repository.
2. In the configuration settings, apply the following details:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Enter critical Environment Variables (do not commit these to source control):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `GROQ_API_KEY`
4. Click **Create Web Service**.

> [!WARNING]
> Keep an eye on Render's sleep policies if you are using the free tier. Your initial API requests may face cold-start delays.

---

## Extension Distribution

### Development (Load Unpacked)
1. Open Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `extension/` directory.

### Production Packaging
When preparing to push updates to users via the Chrome Web Store, zip the folder securely via CLI:

```powershell
# Windows PowerShell Example
Compress-Archive -Path extension\* -DestinationPath jobpilot-extension-v1.0.2.zip
```

Submit this `.zip` file through the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## Post-Deployment Verification

Always validate the build after pushing to production.

- [ ] **Health Check**: Ping `GET /api/health` to confirm `{ db: "connected" }`.
- [ ] **UI Rendering**: The frontend loads smoothly without client-side console errors.
- [ ] **Auth Pipeline**: Registration and Login flows process successfully.
- [ ] **Data Flow**: Job creation, updates, and fetch logic correctly populate the Kanban board.
- [ ] **Scraping Capability**: Extension communicates with the API to extract job listings reliably.
- [ ] **Rate Limiting**: Rapid consecutive requests to endpoints correctly trigger `429 Too Many Requests`.

---

## CI/CD Recommendations

Adopt automated pipelines to shift testing left and ensure stability. Here is a recommended GitHub Actions setup:

```yaml
name: CI Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Test Backend
        run: cd backend && npm ci && npm test
      - name: Test Frontend
        run: cd frontend && npm ci && npm test
```

Vercel natively supports deployment hooks triggers. Render can be configured to auto-deploy upon successful merge to the default production branch.

---

## Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| **Backend crash on startup** | Missing env variables | Audit the Environment tab in Render. |
| **MongoDB connection failed** | Atlas IP Allowlist | Ensure `0.0.0.0/0` is allowed in MongoDB Atlas Network Access. |
| **Frontend fails to reach backend** | CORS Block / Bad URL | Verify `NEXT_PUBLIC_API_URL` and confirm `CORS_ORIGINS` on Render. |
| **Extension shows "Not connected"** | Auth context mismatch | Authenticate through the main web app to synchronize tokens. |

---

## Related Documents

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | High-level system architecture |
| [Performance](./performance.md) | Tuning tips post-deployment |
| [Testing](./testing.md) | Testing strategies |

<br/>

**Next Reading**: [Performance →](./performance.md) | **Previous**: [Frontend →](./frontend.md)
