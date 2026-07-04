<div align="center">
  <img src="./docs/assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>JobPilot Changelog</h1>
  <p><em>All notable changes, architectural shifts, and security patches.</em></p>
</div>

---

## 🚀 [1.0.2] — 2026-07-01: The Security & Performance Release

*This release focused entirely on zero-trust security hardening and backend algorithmic optimization to support enterprise-scale data loads.*

### 🛡️ Security
- **[CRITICAL FIX] Password Oracle Elimination**: Moved the strict equality check *after* `bcrypt.compare()` in the password change pipeline. This completely eliminates the timing oracle vulnerability, making credential harvesting mathematically impossible.
- **[FEATURE] Cryptographic Session Revocation**: Engineered the `tokenVersion` schema implementation into the User model. A password change now instantly increments this integer, instantly invalidating all outstanding JWT sessions globally without requiring heavy Redis blocklists.
- **[HARDENING] Secret Entropy Validation**: The Express daemon now enforces a strict `≥32` character validation on all JWT secrets at process boot.

### ⚡ Performance & Scale
- **[OPTIMIZATION] O(N) Database Reduction**: Refactored the unique username generator. Transitioned from 10,000 independent Mongoose queries down to a single `$regex` database hit coupled with an in-memory `Set` iteration.
- **[OPTIMIZATION] SMTP Connection Pooling**: The `node-cron` reminder worker now utilizes a hash-validated cached SMTP transporter, dramatically reducing TLS handshake overhead.
- **[OPTIMIZATION] Memory-Bound Caching**: The frontend `useJobs` hook now leverages a strict LRU cache (capped at 50 nodes) with automated `AbortController` eviction.

### 🧩 Extension Re-Architecture
- **DOM Extraction Overhaul**: Re-architected the Content Script to prioritize `LD+JSON` `@graph` payloads over brittle CSS selectors.
- **Cross-Context Auth Syncing**: The Background Service Worker now acts as the ultimate source of truth, establishing a secure `jobpilot:auth-updated` runtime bridge with the web DOM.
- **In-Flight Deduplication**: Implemented the `inflightSaves` `Map` to prevent race conditions when a user aggressively clicks the Save button.

---

## ✨ [1.0.1] — 2026-06-28: The UI/UX Stabilization Release

### 🛠️ Added & Changed
- **Playwright Test Matrix**: Introduced a comprehensive End-to-End matrix covering the OAuth flow, the dynamic Kanban board, and the Chrome Extension scraping bridge.
- **Component Granularity**: Massively refactored the monolith `JobDetailView.tsx` from an unmaintainable 1,021 lines down to a streamlined 345 lines across 4 isolated components.
- **Next.js Middleware**: Implemented edge-based JWT verification guards to protect authenticated routes before React even hydrates.

### 🐛 Fixed
- **Private Browsing Crash**: Wrapped all `localStorage` mutations in defensive `try/catch` blocks, failing gracefully to an in-memory `Map` when storage quotas are artificially restricted by Incognito mode.
- **Redux Purity**: Extracted side-effect mutations from the `authSlice` to adhere to strict Redux immutable paradigms.

---

## 🎉 [1.0.0] — 2026-06-15: Initial Launch

*The foundational release of the JobPilot Career Operating System.*

### 🚀 Initial Capabilities
- **The Core Stack**: Next.js 14 App Router, Express 5 REST API, and MongoDB Atlas.
- **The Intelligence Layer**: Groq AI integration (`llama-3.3-70b-versatile`) for instantaneous Cover Letter generation, ATS matching, and Resume parsing.
- **The Ingestion Pipeline**: Google Chrome MV3 Extension capable of unified extraction across 30+ distinct job boards.
- **The Kanban Interface**: Fluid, drag-and-drop React state management for tracking the entire candidate lifecycle (Saved → Applied → Interview → Offer).
- **The Notification Engine**: Paginated `node-cron` workers dispatching daily follow-up email digests.

<br/>
<div align="center">
  <em>JobPilot adheres strictly to <a href="https://semver.org/">Semantic Versioning</a>.</em>
</div>
