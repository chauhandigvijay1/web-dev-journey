<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Engineering Retrospective</h1>
  <p><em>Architectural evolutions, security hardenings, and scalability solutions.</em></p>
</div>

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Security & Cryptographic Hardening](#-security--cryptographic-hardening)
3. [Advanced React State Management](#-advanced-react-state-management)
4. [Data Scraping & Ingestion Strategy](#-data-scraping--ingestion-strategy)
5. [Backend Optimization](#-backend-optimization)
6. [Core Lessons for Scale](#-core-lessons-for-scale)
7. [Related Documentation](#-related-documentation)

---

## 🎯 Executive Summary

JobPilot's journey from a minimum viable product to an enterprise-grade ecosystem involved overcoming significant structural and scale-related hurdles. This retrospective outlines the proactive architectural upgrades, security reinforcements, and performance tunings implemented to guarantee platform resilience under heavy user load.

> [!TIP]
> **Verification-Driven Development:** A core theme of JobPilot's evolution is moving away from assumptions. The solutions below reflect a shift toward rigorous telemetry, defensive programming, and strict network boundaries.

---

## 🛡️ Security & Cryptographic Hardening

### 1. Mitigating Cryptographic Timing Oracles
**The Engineering Challenge:** Comparing user-supplied passwords against the database in a non-constant time environment can expose the application to timing attacks, allowing attackers to infer password correctness microseconds at a time.
**The Structural Solution:** The authentication controller was refactored to ensure that structural equality checks (`currentPassword === newPassword`) only execute *after* the computationally heavy, constant-time `bcrypt.compare()` resolves, neutralizing timing variations.

### 2. Enforcing Strict Network Boundaries (SSRF)
**The Engineering Challenge:** The backend must fetch arbitrary URLs to extract job metadata, inherently creating a Server-Side Request Forgery (SSRF) vector if unvalidated.
**The Structural Solution:** We implemented an active egress filter. Before `axios` resolves a request, the `net.isIP()` utility confirms the destination address does not fall within loopback (`127.0.0.0/8`) or private VPC blocklists (`10.0.0.0/8`, `192.168.0.0/16`), safeguarding internal cloud infrastructure.

### 3. Zero-Trust Credential Management
**The Engineering Challenge:** Preventing accidental credential exposure in CI/CD pipelines and version history.
**The Structural Solution:** Implemented strict Git scrubbing. All `.env` files are aggressively `.gitignore`'d, replaced by templated `.env.example` files, and secrets are injected purely via Render/Vercel platform dashboards.

---

## ⚛️ Advanced React State Management

### 1. Resilient Storage for Incognito Environments
**The Engineering Challenge:** Browsers operating in strict incognito or private modes often block `localStorage` access, causing immediate, unhandled runtime crashes across the React application.
**The Structural Solution:** Implemented a robust `safeGetItem` / `safeSetItem` utility wrapper. If the browser throws an access violation, the wrapper gracefully degrades to an in-memory `Map`, ensuring the application remains fully functional during the session.

### 2. Mitigating Stale Closures in High-Frequency Caches
**The Engineering Challenge:** The `useJobs` hook utilized a custom `fetchCache` Map. Rapid navigation between the Dashboard and Kanban board caused React closures to capture stale instances of the caching Map, leading to memory leaks and unbounded state growth.
**The Structural Solution:** Integrated `AbortController` to sever hanging network requests on unmount. We also bounded the cache via `MAX_CACHE_SIZE = 50` combined with strict LRU (Least Recently Used) eviction logic.

---

## 🌐 Data Scraping & Ingestion Strategy

### 1. Navigating 50+ Job Board DOMs
**The Engineering Challenge:** Relying strictly on CSS selectors to scrape job boards is inherently brittle. A minor UI update on LinkedIn or Indeed would instantly break the extension.
**The Structural Solution:** The extension was re-engineered into a multi-tiered ingestion engine. It first queries for resilient `LD+JSON` structured data, falls back to `microdata`, and only resorts to DOM heuristics (20+ selector arrays) as an absolute last resort.

### 2. Manifest V3 Authentication Synchronization
**The Engineering Challenge:** Synchronizing authentication states across the Web DOM, an MV3 Service Worker, and a popup UI without persistent background scripts.
**The Structural Solution:** The Service Worker acts as the single source of truth utilizing `chrome.storage.local`. If a `401 Unauthorized` is encountered, the worker automatically pauses the save queue, messages the web app for a fresh token sync, and replays the queue.

---

## ⚡ Backend Optimization

### 1. O(N) Query Reduction for Unique Identifiers
**The Engineering Challenge:** Generating unique usernames (e.g., `johndoe1`, `johndoe2`) originally required executing individual MongoDB `$exists` queries inside a loop, creating massive database latency.
**The Structural Solution:** Replaced the loop with a single `$regex` query fetching all matching usernames into an in-memory `Set`. The unique identifier is now computed in memory instantly, reducing 10,000 potential DB hits to exactly 2.

### 2. Singleton SMTP Connections
**The Engineering Challenge:** Initiating a new TLS handshake for every Nodemailer dispatch during the Cron Sweep severely spiked server CPU.
**The Structural Solution:** Implemented a hash-based transporter cache. The SMTP connection pool is maintained continuously across the node process lifecycle, allowing high-throughput batched email dispatch without reconnecting.

### 3. Dynamic Date Evaluation
**The Engineering Challenge:** Mongoose schemas defining `default: Date.now` evaluated the function exactly once upon server import, causing all records to share the exact server boot timestamp.
**The Structural Solution:** Refactored schemas to utilize functional execution `default: () => Date.now()`, ensuring runtime precision for every instantiated document.

---

## 🧠 Core Lessons for Scale

1. **Defense in Depth Works:** Relying on a single line of defense is insufficient. Combining `helmet`, strict CORS, rate-limiting, and JWT versioning creates an impenetrable stack.
2. **Never Trust the Client:** Whether it's a URL submitted for scraping or a storage API in the browser, defensive programming (fallback wrappers, blocklists) is mandatory.
3. **Compound Indexes Are Mandatory:** The moment a table crosses 1,000 rows, in-memory sorting on Node.js becomes a bottleneck. Shifting computation to the MongoDB index engine is critical.

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **Security Posture** | [Security Architecture](./security.md) |
| **Performance Tuning** | [Performance Engineering](./performance.md) |
| **Database Design** | [Database Documentation](./database.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="../README.md">Return to Documentation Hub →</a>
</div>
