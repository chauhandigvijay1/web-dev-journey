<div align="center">
  <img src="./assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Performance Engineering</h1>
  <p><em>Strategies, indexing protocols, and edge caching designed for sub-100ms latency.</em></p>
</div>

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Database Indexing Strategies](#-database-indexing-strategies)
3. [Client-Side Caching (LRU)](#-client-side-caching-lru)
4. [Backend Node Efficiency](#-backend-node-efficiency)
5. [Network & Edge Routing](#-network--edge-routing)
6. [Extension Optimizations](#-extension-optimizations)
7. [Related Documentation](#-related-documentation)

---

## 🎯 Executive Summary

JobPilot’s performance isn't just about fast load times; it's about handling complex AI generation, multi-stage job pipelines, and automated chron jobs without degrading the user experience. By leveraging strict MongoDB compound indexes, in-memory LRU caches on the client, and connection pooling on the server, the platform mimics the responsiveness of a native desktop application.

> [!TIP]
> **Zero Latency Drag-and-Drop:** JobPilot utilizes optimistic UI updates. When a user drags a card on the Kanban board, the DOM reflects the state change instantly while the background synchronization resolves asynchronously via Axios.

---

## 🗄️ Database Indexing Strategies

In a high-throughput SaaS environment, full collection scans are fatal. JobPilot mitigates this via exact compound indexing on MongoDB Atlas.

### 1. The Core Kanban Index
The Kanban board requires sorting hundreds of jobs by status and creation date instantly. 
- **Index Definition:** `{ user: 1, status: 1, createdAt: -1 }`
- **Impact:** Eliminates in-memory sorting, ensuring the database engine returns pre-sorted, paginated cursors instantly.

### 2. The Cron Dispatcher Index
The background `node-cron` worker queries the `ReminderQueue` every 10 minutes.
- **Index Definition:** `{ status: 1, scheduledFor: 1 }`
- **Impact:** The query `db.reminders.find({ status: 'pending', scheduledFor: { $lte: new Date() } })` executes in `<2ms`.

---

## 🧠 Client-Side Caching (LRU)

To prevent redundant API calls when a user rapidly toggles between the Dashboard and Kanban views, JobPilot implements a custom, hook-based LRU (Least Recently Used) cache.

### The `useJobs` Architecture
- **In-Memory Singleton:** Caches the last 50 payloads inside a JavaScript `Map`.
- **Deduplication:** Utilizes a Promise singleton (`inFlight`) so if a component mounts twice simultaneously, only one network request fires.
- **AbortControllers:** If a user navigates away before a request finishes, the `AbortController` cleanly severs the HTTP connection to preserve bandwidth.

---

## ⚙️ Backend Node Efficiency

The Express 5 monolith utilizes several built-in tuning layers to minimize CPU spikes:

- **SMTP Connection Pooling:** Creating a TLS connection to an SMTP server (like SendGrid or Gmail) takes ~500ms. JobPilot instantiates the Nodemailer transporter once, caching the connection in memory to process batched reminders concurrently without TLS renegotiation.
- **Payload Compression:** The `compression` middleware intercepts outgoing payloads and applies GZIP compression, reducing JSON transfer sizes by up to 70%.
- **Lean Queries:** Whenever Mongoose data is strictly mapped to JSON without requiring virtuals or getters, the API strictly chains `.lean()` to bypass the heavy Mongoose document instantiation process.

---

## 🌐 Network & Edge Routing

The Next.js presentation layer is heavily optimized for edge delivery on Vercel.

| Optimization | Implementation Detail |
|--------------|-----------------------|
| **Image Formatting** | Next.js `<Image>` component rewrites Cloudinary and Google profile URLs, converting massive JPEGs into deeply optimized `WebP` or `AVIF` formats on the fly. |
| **Font Optimization** | Google Fonts (like `Inter`) are downloaded at build-time and injected locally, eliminating critical-path network jumps to `fonts.googleapis.com`. |
| **Route Prefetching** | The `<Link>` component automatically prefetches chunks for visible dashboard routes, ensuring near-instantaneous page transitions. |

---

## 🧩 Extension Optimizations

The Manifest V3 (MV3) Chrome Extension is constrained by strict memory limits and ephemeral service workers.

- **Exponential Backoff:** If the JobPilot Core API initiates a `429 Too Many Requests` block, the extension gracefully backs off (e.g., waiting 2s, then 4s, then 8s) rather than spamming dead connections.
- **chrome.alarms API:** Rather than using `setInterval` (which MV3 terminates), background synchronization loops leverage `chrome.alarms` for CPU-efficient wake events.

---

## 📚 Related Documentation

| Area | Resource |
|------|----------|
| **System Architecture** | [Architecture Guide](./architecture.md) |
| **Next.js Implementation** | [Frontend Documentation](./frontend.md) |

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="./workflow.md">Workflow Automation →</a>
</div>
