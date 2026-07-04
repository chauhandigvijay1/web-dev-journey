<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Diagnostic & Troubleshooting Runbook</h1>
  <p><em>Standard Operating Procedures (SOPs) for configuring and debugging the JobPilot ecosystem.</em></p>
</div>

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Backend Diagnostics](#-backend-diagnostics)
3. [Frontend Diagnostics](#-frontend-diagnostics)
4. [Extension Diagnostics](#-extension-diagnostics)
5. [Database Telemetry](#-database-telemetry)
6. [Deployment Verifications](#-deployment-verifications)
7. [Error Code Matrix](#-error-code-matrix)

---

## 🎯 Executive Summary

JobPilot's highly decoupled architecture (Next.js, Express, MV3, MongoDB) requires precise environmental synchronization. This document provides actionable diagnostic workflows to resolve configuration mismatches and environment initialization issues.

---

## ⚙️ Backend Diagnostics

### Issue: Startup Process Halts (`Missing required env var`)
**The Context:** The backend employs aggressive startup validation to prevent silent runtime failures.
**The Resolution:** Ensure your `.env` contains the required quartet: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `GROQ_API_KEY`.

### Issue: `JWT_SECRET must be at least 32 characters long`
**The Context:** Cryptographic standards enforce high-entropy secrets to prevent brute-force token forging.
**The Resolution:** Generate a cryptographically secure 32+ character string. 
```bash
# Example generation in bash
openssl rand -base64 32
```

### Issue: `DEFAULT_TIMEZONE is invalid`
**The Context:** The cron reminder system requires strict IANA timezone mappings to prevent timezone drift.
**The Resolution:** Map `DEFAULT_TIMEZONE` to a valid IANA database string (e.g., `America/New_York`, `Asia/Kolkata`).

---

## ⚛️ Frontend Diagnostics

### Issue: Infinite Authentication Redirect Loop
**The Context:** The Next.js middleware enforces route protection by validating the presence of the `jobpilot_refresh` cookie.
**The Resolution:** 
1. Open Chrome DevTools → Application → Cookies.
2. Verify `jobpilot_refresh` is present.
3. Ensure the `AUTH_COOKIE_NAME` environment variable is identical across both the frontend and backend deployments.

### Issue: Google One-Tap Interface Fails to Mount
**The Context:** Google's OAuth SDK requires strict origin whitelisting.
**The Resolution:** Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set and that your exact development/production URL (e.g., `http://localhost:3000`) is registered under **Authorized JavaScript origins** in your Google Cloud Console.

---

## 🧩 Extension Diagnostics

### Issue: Popup Indicates "Not Connected"
**The Context:** The MV3 extension operates statelessly and relies on the web application for its JWT payload.
**The Resolution:** Navigate to the JobPilot web application and authenticate. The content script will dynamically intercept the token and synchronize it with the extension's background service worker.

### Issue: Save Attempt Silently Rejects
**The Context:** The extension intercepts expired tokens or aggressive rate limits and queues retries.
**The Resolution:** Inspect the Service Worker logs (`chrome://extensions` → JobPilot → Inspect views: `background.js`) to view the telemetry. Usually, navigating back to the web application to force a token refresh clears the queue.

---

## 🗄️ Database Telemetry

### Issue: Latency Spikes on Kanban Hydration
**The Context:** As a user accumulates hundreds of jobs, raw Mongoose queries without indices become a bottleneck.
**The Resolution:** Verify that the compound index has been successfully instantiated on your MongoDB cluster:
```javascript
// Required Kanban Index
db.jobs.createIndex({ user: 1, status: 1, updatedAt: -1 })
```

### Issue: `409 Conflict` During Registration
**The Context:** The database strictly enforces uniqueness on both the `email` and `username` vectors to prevent state corruption.
**The Resolution:** This is expected architectural behavior. The UI should gracefully catch the `409` and prompt the user to utilize a different handle.

---

## 🚀 Deployment Verifications

### Issue: Vercel Build Hydration Errors
**The Context:** Server-Side Rendered (SSR) pages expecting API configuration at build time.
**The Resolution:** Ensure `NEXT_PUBLIC_API_URL` is configured in the Vercel Project Settings prior to triggering the deployment pipeline.

### Issue: Render CORS Blocks Frontend Traffic
**The Context:** The Express API defaults to a strict `cors` policy, rejecting all unknown origins.
**The Resolution:** In your Render dashboard, explicitly define the `FRONTEND_URL` and `CORS_ORIGINS` to match your Vercel deployment domain.

---

## 🚨 Error Code Matrix

| Error Signature | Architectural Context | Resolution Workflow |
|-----------------|-----------------------|---------------------|
| `429 Too Many Requests` | API Abuse Protection | Global (250/15m) or AI (20/15m) limit hit. Await the TTL reset. |
| `503 Service Unavailable`| Inference Engine Disconnected | Verify `GROQ_API_KEY` validity in the backend environment. |
| `MongoNetworkError` | Cluster Egress Blocked | Validate that your backend IP (or `0.0.0.0/0`) is whitelisted in MongoDB Atlas. |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="./faq.md">Frequently Asked Questions →</a>
</div>
