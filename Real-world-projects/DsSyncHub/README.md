<div align="center">
  <img alt="DsSync Hub Logo" src="./client/public/logo_icon.svg" width="120" height="120">

  <h1>DsSync Hub</h1>
  <p><strong>A production-grade, open-source SaaS collaboration platform for modern teams.</strong></p>

  <p>
    <a href="https://dssync-hub-client.vercel.app" target="_blank">Live Demo</a> —
    <a href="docs/index.md">Documentation</a> —
    <a href="https://github.com/chauhandigvijay1/web-dev-journey/tree/main/Real-world-projects/DsSyncHub">GitHub Repo</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Production-Ready-00C851?style=flat-square" alt="Production Ready" />
    <img src="https://img.shields.io/badge/License-ISC-blue?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Groq-AI_LLM-F55036?style=flat-square&logo=groq" alt="Groq AI" />
  </p>
</div>

---

<div align="center">
  <a href="https://player.cloudinary.com/embed/?cloud_name=dtdvtkzsm&public_id=DsSyncHub-Final_fk7fl6">
    <img src="docs/assets/gifs/app-motion-demo.gif" alt="DsSync Hub Motion Demo" width="800" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" onerror="this.src='docs/assets/screenshots/LandingPage.png'" />
  </a>
  <em>Click above to watch the official DsSyncHub motion Video.</em>
</div>

<details>
<summary><strong>📖 Table of Contents</strong></summary>

- [Overview & Mission](#overview--mission)
- [Technical Achievements](#technical-achievements)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Database Schema & API](#database-schema--api)
- [Security & Performance](#security--performance)
- [Visual Showcase](#visual-showcase)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Roadmap & Limitations](#roadmap--limitations)
- [Contributing](#contributing)
- [License & Author](#license--author)

</details>

---

## Overview & Mission

DsSync Hub is a **production-grade, multi-tenant SaaS collaboration platform** engineered for teams that need task management, real-time communication, document collaboration, video meetings, AI assistance, and billing — all in one unified workspace.

This is not a tutorial project. It is an enterprise-ready foundation demonstrating deep systems thinking, secure multi-tenant isolation, real-time data consistency, and resilient architecture across 17 data models and API controllers.

---

## Technical Achievements

We solved multiple complex scaling and consistency problems during development:

- **Multi-API-key AI fallback**: Comma-separated `GROQ_API_KEY` env var with sequential retry + 100ms delay + 12-second strict timeout.
- **Ephemeral Render storage**: Cloudinary integration with automatic local fallback + production warnings for persistence.
- **Socket Singleton Disconnect**: Removed `disconnectSocket()` from component cleanup — all features share one global persistent socket.
- **Data-Race Prevention**: Attached `io` to the Express app via `app.set('io', io)`. REST controllers update the database *then* emit socket events, ensuring the database is always the single source of truth.
- **Multi-tenant Data Isolation**: Membership-based query filtering enforced on all 17 controllers via compound indexing.
- **Email Port Blocking (Render)**: Bull queue with 3 retries (exponential backoff) using SendGrid HTTP API as primary, and Resend/SMTP as fallbacks.
- **Billing Load Order**: Lazy `getRazorpayClient()` initialization with env var trimming + Coupon code system for direct Pro upgrades independent of Razorpay.
- **Concurrent Note Editing**: Socket.io broadcasts + `queryCommandSupported` guards for link management.

---

## System Architecture

DsSync Hub operates on a highly scalable decoupled topology, leveraging WebSockets for sub-50ms synchronization and managed cloud services for zero baseline hosting costs.

```mermaid
graph TD
    subgraph Client [Client / Vercel SPA]
        React[React 19, TypeScript, Vite 8]
        RTK[Redux Toolkit, Socket.io-client]
    end

    subgraph Server [Node API / Render]
        Express[Express 5, Node 20]
        Middlewares[Auth, Sanitizer, RateLimit]
        Sockets[Socket.io 4 - Chat, Task, Note, Calendar]
        Services[AI, Billing, Email]
    end

    Client -->|HTTPS REST| Express
    Client <-->|WSS Real-Time| Sockets

    Express -->|Mongoose 8| DB[(MongoDB Atlas)]
    Sockets -->|Presence| DB
    Express -->|Bull Queue| Redis[(Upstash Redis)]
    
    Services -.->|Storage| Cloudinary[Cloudinary API]
    Services -.->|Billing| Razorpay[Razorpay API]
    Services -.->|AI| Groq[Groq API]
```
> For a deeper dive, view the [System Architecture Blueprint](docs/architecture.md).

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19 & Vite 8** | Concurrent UI with sub-second HMR and optimized vendor chunking |
| **TypeScript 6** | Strict mode, full type safety across 13 type modules |
| **Tailwind CSS 4** | Utility-first styling with custom design system and dark mode |
| **Redux Toolkit 2** | Global state management with 16 slices (`createAsyncThunk`) |
| **Socket.io-client** | Real-time bidirectional communication with auto-reconnect |
| **React Hook Form + Zod** | Type-safe form validation with schema-based error messages |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express 5 (Node 20)** | HTTP server, middleware pipeline, REST routing (17 modules) |
| **Mongoose 8 (MongoDB)** | ODM with schema validation, compound indexes, population |
| **Socket.io 4** | WebSocket server with shared JWT auth middleware and namespaces |
| **JWT + bcrypt** | Token-based auth with token versioning, 12-round password hashing |
| **DOMPurify** | Client-side HTML sanitization for note editor (ALLOWED_TAGS) |
| **Pino** | Structured JSON logging with redaction, serializers, pino-http |

### Infrastructure
| Service | Purpose | Guard |
|---------|---------|-------|
| **Upstash Redis** | Distributed rate limiting, Socket.io adapter, Bull queue | Skipped when `REDIS_URL` unset |
| **Cloudinary** | Cloud media storage with CDN delivery | Falls back to local when unset |
| **Jitsi Meet** | Free, open-source HD video conferencing | Always on — no account required |
| **Bull Queue** | Background email job queue | Falls back to direct send |

### DevOps
- **Vercel** — Frontend hosting with automatic SSL, global CDN.
- **Render** — Backend hosting with auto-deploy from GitHub.
- **GitHub Actions** — CI/CD: 92 backend tests + frontend build/lint on every push/PR.

---

## Database Schema & API

### Data Model (17 Models)
Every resource belongs to a workspace. Access is enforced via the `Membership` join table with strict roles: `owner`, `admin`, `member`, `viewer`.

```text
User ───────────┐
├─ Membership ──┤── Workspace
├─ Notification │   ├─ Task ─── TaskComment
├─ AiUsage      │   ├─ Note
├─ Subscription │   ├─ Message ─── Channel
├─ BillingInvoice│   ├─ FileAsset
└─ Invite       │   ├─ CalendarEvent
                │   ├─ Meeting
                │   └─ ActivityLog
```

### API Overview
All routes are mounted under `/api` and `/api/v1` for backward compatibility.

| Module | Endpoints | Auth Required |
|--------|-----------|------|
| **Auth** | Register, Login, Google, Logout, Forgot/Reset Password, Verify Email, Send Verification | Mixed |
| **Users** | Profile CRUD, Change Password, Upload Avatar, Logout All | JWT |
| **Workspaces**| CRUD, Invite Member, Join by Code, List Members, Update/Remove Member, Export as ZIP | Mixed |
| **Tasks** | CRUD, Move Status, Complete, Archive | JWT |
| **Notes** | CRUD, Pin, Archive, Duplicate, Public Share | JWT |
| **Chat** | Messages CRUD, Edit, Delete, Reactions | JWT |
| **Channels** | CRUD with workspace-scoped unique slug | JWT |
| **Calendar** | CRUD with date-range filtering, color coding | JWT |
| **Meetings** | Room CRUD, Join Metadata, Upcoming List | JWT |
| **Files** | Upload, List, Stream/Download, Delete | JWT |
| **Billing** | Plans, Create Order, Verify Payment, Invoices, Cancel Subscription | JWT |
| **AI** | Summarize, Rewrite, Generate Tasks | JWT |
| **Search** | Global search across tasks, notes, messages, users, files | JWT + rate limited |
| **Notifications** | List, Mark Read, Mark All Read, Delete | JWT |
| **Activity** | List with actor population, filter by entity | JWT |
| **Admin** | Stats, Users CRUD, Workspaces List, Role Update | JWT + Admin |
| **Export** | Download workspace data as ZIP | JWT |

---

## Security & Performance

DsSync Hub implements defense-in-depth across the entire stack:

- **Authentication**: JWT with token versioning for instant session invalidation across all devices.
- **XSS Prevention**: Note content sanitized server-side (Regex stripping `script/style/iframe/object` and event handlers) + client-side (DOMPurify `ALLOWED_TAGS` whitelist).
- **Input Validation**: Custom sanitizer stripping `<>{}$` across all inputs.
- **Rate Limiting**: Redis-backed global limiter (500/15min) + auth (10/15min) + search (30/min).
- **Security Headers**: Helmet with CSP, CORS whitelist, and production cross-origin policies.
- **Cookies**: `httpOnly`, `sameSite`, and `secure` in production.
- **Error Handling**: No stack traces in production error handler, managed via Sentry.

---

## Visual Showcase

To avoid cluttering this document, the visual assets are organized into collapsible sections.

<details>
<summary><strong>🖼️ Application Screenshots (Static Views)</strong></summary>

| Workspace Dashboard | Landing Page |
| :---: | :---: |
| <img src="docs/assets/screenshots/dashboard.png" width="400"/> | <img src="docs/assets/screenshots/LandingPage.png" width="400"/> |

| Workspaces | Real-Time Chat |
| :---: | :---: |
| <img src="docs/assets/screenshots/workspaces.png" width="400"/> | <img src="docs/assets/screenshots/chatpage.png" width="400"/> |

| Video Meetings | Subscription & Billing |
| :---: | :---: |
| <img src="docs/assets/screenshots/meeting.png" width="400"/> | <img src="docs/assets/screenshots/billingpage.png" width="400"/> |

| Workspace Settings | Authentication Flow |
| :---: | :---: |
| <img src="docs/assets/screenshots/settingspage.png" width="400"/> | <img src="docs/assets/screenshots/loginpage.png" width="400"/> |

</details>

<details>
<summary><strong>🎥 Interactive Workflows (GIFs)</strong></summary>

#### Sub-50ms Real-Time Chat Sync
![Real-Time Chat](docs/assets/gifs/real-time-sync.gif)

#### Sharing Todo with mention comments
![ToDo Tasks shared](docs/assets/gifs/Todo-update.gif)

#### Seamless Video Meeting Join
![Video Meeting](docs/assets/gifs/video-meeting-join.gif)

#### Coupon and billing setup
![Billing and payments](docs/assets/gifs/billing-and-payments.gif)

</details>

---

## Installation

### Prerequisites
- Node.js >= 20.x
- MongoDB instance (Local or Atlas)
- Redis instance (Optional, falls back gracefully)

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/chauhandigvijay1/DsSyncHub.git
cd DsSyncHub

# 2. Install dependencies (Root, Server, and Client)
npm run install:all

# 3. Setup Environment Variables (copy from examples)
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Start the development environment (concurrently)
npm run dev
```

---

## Environment Variables

Never expose production secrets. Reference `server/.env.example`.

| Variable | Requirement | Purpose | Example Placeholder |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Express server port | `5000` |
| `MONGO_URI` | **Required** | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | **Required** | Cryptographic key for Auth | `your_super_secret_jwt_key` |
| `JWT_EXPIRES_IN` | Optional | Token expiry duration | `7d` |
| `FRONTEND_URL` | **Required** | CORS origin whitelist | `http://localhost:5173` |
| `REDIS_URL` | Optional | Rate limiting, Socket.io adapter & Bull queue | `redis://default:pass@redis-host:6379` |
| `GROQ_API_KEY` | Optional | Enables AI assistant (comma-separated for key rotation) | `gsk_your_api_key_here` |
| `CLOUDINARY_URL` | Optional | Enables cloud uploads (or use individual `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET`) | `cloudinary://key:secret@cloud_name` |
| `RAZORPAY_KEY_ID` | Optional | Enables billing (Razorpay public key) | `rzp_test_your_key_here` |
| `RAZORPAY_KEY_SECRET` | Optional | Enables billing (Razorpay secret key) | `rzp_test_secret_here` |
| `SENTRY_DSN` | Optional | Production error tracking | `https://key@o.ingest.sentry.io/project` |
| `COUPON_CODE` | Optional | Owner coupon for free Pro upgrades | `OWNER_SECRET` |

---

## Roadmap & Limitations

**Current Limitations**:
- Ephemeral storage on Render means local uploads (`/uploads`) are deleted upon server restart. You **must** configure Cloudinary for production persistence.
- Jitsi Meet integration utilizes the public API, meaning video rooms are not cryptographically isolated unless deployed to a self-hosted Jitsi instance.

**Upcoming Roadmap**:
1. Docker Compose for reproducible local development
2. Database migration/seeding script for demo data
3. OpenAPI/Swagger specification

> Read the full [Future Plans & Vision](docs/future-plans.md).

---

## Contributing

We welcome community contributions! Please read our [Contributing Guide](docs/contributing-guide.md) to understand our Git workflows, branching strategies, and Code of Conduct.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License & Author

Distributed under the **ISC License**. Free to use, modify, and deploy. See `LICENSE` for more information.

**Digvijay Kumar Singh**
*Senior Software Engineer & Open Source Maintainer*

<p>
  <a href="https://www.linkedin.com/in/digvijaykumarsingh"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin" alt="LinkedIn"/></a>
  <a href="https://github.com/chauhandigvijay1"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github" alt="GitHub"/></a>
  <a href="mailto:chauhandigvijay669@gmail.com"><img src="https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail" alt="Email"/></a>
</p>

---

<p align="center">
  If you found this project valuable, please consider giving it a <strong>star</strong> ⭐<br/>
  <sub>Built with care — not for a tutorial, but for real teams.</sub>
</p>
