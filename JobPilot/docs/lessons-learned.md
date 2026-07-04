<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Lessons Learned & Architectural Retrospective</h1>
  <p><em>Scaling challenges, security epiphanies, and technical debt reflections.</em></p>
</div>

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Securing the Network Boundary](#-securing-the-network-boundary)
3. [Chrome Extension Dynamics](#-chrome-extension-dynamics)
4. [Mastering React State](#-mastering-react-state)
5. [Database Optimization](#-database-optimization)
6. [Related Documentation](#-related-documentation)

---

## 🎯 Executive Summary

Building JobPilot required weaving together a Next.js edge-rendered frontend, a Node.js API, an AI inference layer, and a Manifest V3 browser extension. Through extensive production auditing and real-world stress testing, we encountered and resolved several complex architectural challenges. This document catalogs those lessons to guide future contributors in understanding *why* certain technical decisions were made.

> [!NOTE]
> Every constraint detailed below has been actively resolved or structurally mitigated in the current `main` branch. They serve as historical context for engineering decisions.

---

## 🛡️ Securing the Network Boundary

### The Threat of Server-Side Request Forgery (SSRF)
**The Context:** The JobPilot Chrome Extension sends URLs to the backend API, asking the server to scrape job metadata. 
**The Lesson:** Naively passing a user-supplied URL directly into an `axios.get()` call is dangerous. An attacker could theoretically pass `http://169.254.169.254` to access internal cloud metadata, or `http://localhost:6379` to interact with internal databases.
**The Solution:** We implemented a rigorous SSRF protection layer. All requested URLs are computationally resolved to their underlying IP addresses and verified against a strict blacklist of private and loopback ranges before the server initiates the fetch.

### JWT Rotation and Seamless UX
**The Context:** Security best practices dictate short-lived access tokens (15 minutes). However, forcing users to log in every 15 minutes is terrible UX.
**The Lesson:** Implementing a dual-JWT system requires extreme care on the client side to avoid race conditions.
**The Solution:** We built an Axios interceptor singleton. When a `401 Unauthorized` hits, the interceptor pauses all incoming requests, uses the secure `httpOnly` cookie to fetch a fresh token, updates local state, and seamlessly replays the queued requests.

---

## 🧩 Chrome Extension Dynamics

### MV3 Service Worker Volatility
**The Context:** Manifest V3 (MV3) mandates the use of background Service Workers, which Chrome aggressively terminates to save memory when idle.
**The Lesson:** Storing state (like authentication tokens or extracted data) in standard javascript variables (`let token = ...`) inside `background.js` results in catastrophic data loss when the worker sleeps.
**The Solution:** MV3 backgrounds must be built completely stateless. Every piece of critical data must be routed immediately through `chrome.storage.local`, utilizing robust Promise wrappers to ensure data persistence across worker reboots.

### Message Spoofing Protections
**The Context:** The extension relies on `chrome.runtime.onMessageExternal` to communicate with the Next.js web application.
**The Lesson:** Without strict validation, any malicious extension installed on a user's browser could theoretically send spoofed messages to our listener and hijack API keys.
**The Solution:** We strictly validate `sender.id` against our exact Chrome Web Store Extension ID, discarding any payloads originating from untrusted sources.

---

## ⚛️ Mastering React State

### Stale Closures in Complex UIs
**The Context:** The Kanban board allows users to rapidly drag and drop multiple jobs across columns.
**The Lesson:** Relying on `useEffect` timers or standard state references for optimistic UI updates often resulted in "stale closures"—where React would accidentally overwrite new states with old memory snapshots.
**The Solution:** For all high-frequency mutations, we strictly enforce functional state updates (e.g., `setJobs(prev => computeNewState(prev))`) to guarantee operations apply sequentially to the absolute latest DOM snapshot.

---

## 🗄️ Database Optimization

### Escaping the O(N) Trap
**The Context:** The `node-cron` reminder service runs every 10 minutes to scan the `ReminderQueue` for due follow-ups.
**The Lesson:** In early testing, this operation scanned the entire collection. As the table grew to thousands of rows, the database CPU spiked drastically.
**The Solution:** Compound Indexes are non-negotiable. By applying `{ status: 1, scheduledFor: 1 }`, the MongoDB engine jumps directly to the relevant documents, converting an O(N) scan into an O(1) lookup.

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **Overall Architecture** | [Architecture Guide](./architecture.md) |
| **Performance Tuning** | [Performance Optimization](./performance.md) |
| **Upcoming Features** | [Future Plans](./future-plans.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="../README.md">Return to Documentation Hub →</a>
</div>
