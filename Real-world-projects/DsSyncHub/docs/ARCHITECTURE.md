# Architecture

> Deep dive into the system design, data flow, and engineering decisions behind DsSync Hub.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Layered Architecture](#layered-architecture)
3. [Data Model & Relationships](#data-model--relationships)
4. [Authentication Flow](#authentication-flow)
5. [Real-Time Architecture](#real-time-architecture)
6. [Multi-Tenancy Model](#multi-tenancy-model)
7. [File Storage Strategy](#file-storage-strategy)
8. [Billing Pipeline](#billing-pipeline)
9. [AI Integration](#ai-integration)
10. [Security Architecture](#security-architecture)
11. [Deployment Topology](#deployment-topology)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vercel)                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    React 19 SPA                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │ Pages    │ │Components│ │  Hooks   │ │  Store       │  │   │
│  │  │ (22)     │ │ (shared) │ │ (custom) │ │  (16 slices) │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  │                                                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │   │
│  │  │ API      │ │ Socket   │ │ Utils    │                   │   │
│  │  │ (17)     │ │ (client) │ │          │                   │   │
│  │  └──────────┘ └──────────┘ └──────────┘                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Services: Vite · Tailwind CSS · React Router · Redux Toolkit       │
│  · React Hook Form · Zod · Socket.io-client · Sentry React          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    HTTPS + WSS │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVER (Render)                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Express 5 Application                     │   │
│  │                                                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ Routes   │→ │Middleware│→ │Controllers│→ │ Services │  │   │
│  │  │ (15)     │  │ (5)      │  │ (14)      │  │ (4)      │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ Socket.io Server (4 namespaces: Chat/Task/Note/Cale │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  Optional: Sentry · Redis · Cloudinary                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Services: Mongoose · JWT · bcrypt · Nodemailer · Razorpay · Multer│
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                          Mongoose │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MONGODB ATLAS                                  │
│                                                                     │
│  Collections: User · Workspace · Membership · Task · TaskComment    │
│  · Note · Message · Channel · CalendarEvent · Meeting · FileAsset   │
│  · Invite · Notification · ActivityLog · Subscription               │
│  · BillingInvoice · AiUsage                                         │
│                                                                     │
│  Replica Set with 3 nodes (M30 free tier)                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layered Architecture

### 1. Routes Layer (`server/src/routes/`)

15 route modules defining HTTP method + path + middleware chain + controller binding.

```
/auth        → authMiddleware (partial), rateLimiter
/users       → serveAvatar (public), authMiddleware (private)
/workspaces  → varies by endpoint (some public for invite flow)
/tasks       → authMiddleware
/notes       → authMiddleware
/chat        → authMiddleware
/channels    → authMiddleware
/calendar    → authMiddleware
/meetings    → authMiddleware
/files       → authMiddleware
/billing     → authMiddleware
/ai          → authMiddleware
/search      → authMiddleware
/notifications → authMiddleware
/activity    → authMiddleware
```

### 2. Middleware Layer (`server/src/middleware/`)

| Middleware | Role |
|-----------|------|
| `authMiddleware.js` | JWT verification, user hydration, token version check |
| `sanitizeInput.js` | Strips `<>{}$` from all request bodies to prevent XSS |
| `errorHandlers.js` | Global 404 handler + production-safe error serializer |
| `validateRequest.js` | Request body validation with customizable rules |
| `aiUsageLimit.js` | Per-workspace AI request quota enforcement |

Pipeline order in `app.js`:
```
helmet → cors → morgan(dev) → rateLimiter → cookieParser → json
→ urlencoded → sanitizeInput → [Sentry requestHandler] → routes
→ [Sentry errorHandler] → 404 handler → error handler
```

### 3. Controller Layer (`server/src/controllers/`)

15 controller modules. Every controller follows the same pattern:
1. Extract params from `req.params`, `req.query`, `req.body`
2. Validate input (early return with 400)
3. Fetch membership (early return with 403)
4. Perform business logic
5. Return standardized JSON: `{ success, data/message }`

The workspace membership pattern:
```js
const membership = await Membership.findOne({
  user: req.user._id,
  workspace: workspaceId,
  status: 'active',
})
if (!membership) return res.status(403).json({ ... })
```

### 4. Service Layer (`server/src/services/`)

| Service | Responsibility |
|---------|---------------|
| `emailService.js` | Nodemailer transport singleton + 3 email templates (reset, verify, invite) |
| `storageService.js` | Local filesystem + Cloudinary upload with MIME validation |
| `planLimits.js` | Plan-based storage caps and member limits for Free/Pro tiers |
| `aiService.js` | Groq API client with multi-key fallback + usage tracking |

### 5. Socket Layer (`server/src/socket/`)

4 socket modules, each scoped to workspace rooms:

| Socket | Room Pattern | Events |
|--------|-------------|--------|
| `chatSocket.js` | `workspace:{id}` | message:send, message:edit, message:delete, typing:start, typing:stop |
| `taskSocket.js` | `workspace:{id}` | task:created, task:updated, task:moved, task:deleted |
| `noteSocket.js` | `workspace:{id}` | note:created, note:updated, note:deleted |
| `calendarSocket.js` | `workspace:{id}` | calendar:created, calendar:updated, calendar:deleted |

All socket events verify workspace membership via a database lookup before broadcasting.

---

## Data Model & Relationships

### Core Entities

```
User
├── fullName, email, username, phone, passwordHash
├── avatarUrl, bio, timezone
├── emailVerified, emailVerificationToken, emailVerificationExpiresAt
├── provider (local | google), googleId
├── role, tokenVersion
├── appearance (theme, accentColor, compactMode)
├── backupEmail
│
├── Membership (join table to Workspace)
│   ├── user, workspace
│   ├── role (owner | admin | member | viewer)
│   ├── status (active | pending | invited)
│   ├── invitedBy, joinedAt
│   └── unique compound index on {user, workspace}
│
├── Workspace (owned)
├── Notification
├── Subscription
├── BillingInvoice
├── AiUsage
└── Invite
```

### Workspace-Scoped Entities

```
Workspace
├── Task
│   ├── title, description, status (todo|in_progress|review|done)
│   ├── priority (low|medium|high|critical), dueDate
│   ├── assignee, createdBy, order
│   ├── attachments (embedded subdocs)
│   └── TaskComment (embedded subdocs)
│
├── Note
│   ├── title, content (HTML string)
│   ├── owner, lastEditedBy
│   └── tags, isPinned, shareToken
│
├── Message
│   ├── content, sender
│   ├── channel references Channel
│   ├── attachments (embedded subdocs)
│   └── editedAt, deletedAt
│
├── Channel
│   ├── name, description
│   ├── type (general | channel | direct)
│   └── members (array of User refs)
│
├── CalendarEvent
│   ├── title, description
│   ├── date, endDate, allDay
│   ├── source (manual|task|meeting|invite)
│   ├── linkedEntityId (polymorphic reference)
│   └── color
│
├── FileAsset
│   ├── name, originalName, url, storagePath
│   ├── size, mimeType, provider (local|cloudinary)
│   ├── source (chat|task|note|general)
│   └── linkedEntityId
│
├── Meeting
│   ├── title, description, startTime, endTime
│   ├── createdBy, status (scheduled|ongoing|ended|cancelled)
│   └── agenda
│
├── ActivityLog
│   ├── actor, action, entityType, entityId
│   ├── summary (human-readable string)
│   └── metadata (JSON store for extensible data)
│
├── Invite
│   ├── email, token (random 32 hex chars)
│   ├── role, expiresAt (7 days)
│   └── acceptedAt
│
└── Notification
    ├── user, type (invite|payment|mention|system)
    ├── title, message, link
    ├── read, metadata
    └── readAt
```

### Index Strategy

Compound indexes on high-query patterns:
- `Membership: { user: 1, workspace: 1 }` (unique)
- `Task: { workspace: 1, status: 1, order: 1 }`
- `Message: { workspace: 1, channel: 1, createdAt: -1 }`
- `CalendarEvent: { workspace: 1, date: 1 }`
- `FileAsset: { workspace: 1, createdAt: -1 }`
- `ActivityLog: { workspace: 1, createdAt: -1 }`
- `Notification: { user: 1, read: 1, createdAt: -1 }`
- `Invite: { token: 1 }` (unique)

---

## Authentication Flow

### Email/Password Registration
```
Client                    Server                    MongoDB
  │                         │                         │
  │──POST /auth/register───>│                         │
  │   {fullName,email,     │                         │
  │    username,password}   │                         │
  │                         │──User.findOne(email)───>│
  │                         │<──null─────────────────│
  │                         │──hash(password, 12)────│
  │                         │──User.create({...})────>│
  │                         │──generate JWT──────────│
  │                         │──set httpOnly cookie───│
  │<──{user, token}────────│                         │
```

### JWT Verification
```
Request
  │
  ├─ Cookie (accessToken) or Authorization header
  │
  ▼
authMiddleware
  │
  ├─ jwt.verify(token, JWT_SECRET) → payload {id, tokenVersion}
  │
  ├─ User.findById(payload.id)
  │  └─ Verify tokenVersion matches (invalidation on password change)
  │
  ├─ req.user = userDocument
  │
  ▼
Controller (req.user available)
```

### Token Versioning
Every user has a `tokenVersion` field (default 0). On password change or "logout all sessions", the version increments. All existing JWTs become invalid because the payload's `tokenVersion` no longer matches the database value.

---

## Real-Time Architecture

### Connection Lifecycle
```
Client                          Server
  │                               │
  │──socket.io handshake─────────>│
  │   (auth: { token })           │
  │                               │──jwt.verify(token)
  │                               │──User.findById(id)
  │<──connected (socket.id)──────│
  │                               │
  │──join workspace:{id}─────────>│
  │                               │──Membership.findOne(...)
  │                               │──socket.join(`workspace:${id}`)
  │<──joined─────────────────────│
```

### Event Flow
```
User A (creates task)            Server                    User B, C, D
  │                               │                         │
  │──task:create─────────────────>│                         │
  │   {title, status, ...}        │                         │
  │                               │──Membership check       │
  │                               │──Task.create()          │
  │                               │                         │
  │                               │──io.to("workspace:${id}")
  │                               │   .emit("task:created") │
  │                               │────────────────────────>│
  │                               │────────────────────────>│
  │                               │────────────────────────>│
  │<──response {task}────────────│                         │
```

### Frontend Integration
Each real-time module follows the same pattern:
1. Custom hook (`useTaskSocket`, `useNoteSocket`, etc.) connects on mount
2. Listens for socket events → dispatches Redux actions (`addIncomingTask`, `updateIncomingTask`, etc.)
3. Redux reducers merge incoming data into the existing state
4. Components re-render via `useSelector` subscriptions

---

## Multi-Tenancy Model

### Data Isolation
Every document in a workspace-scoped collection has a `workspace` field referencing the `Workspace` ObjectId. Queries always filter by workspace:

```js
Task.find({ workspace: workspaceId, ... })
```

### Membership Enforcement
Every controller obtains the requester's membership before any operation:

| Operation | Membership Required | Role Check |
|-----------|-------------------|------------|
| Read tasks/notes/messages | Active membership | None (any role) |
| Create task/note | Active membership | `member`+ (not `viewer`) |
| Create channel | Active membership | `admin`+ |
| Invite member | Active membership | `admin`+ |
| Delete workspace | Active membership | `owner` only |
| Archive workspace | Active membership | `owner` only |

### Invite Flow
1. Admin creates invite → `Invite` document with random token + 7-day expiry
2. Email dispatched via Nodemailer with HTML template
3. Recipient clicks link → frontend calls accept endpoint with token
4. Server validates token → creates/updates `Membership` with `status: 'active'`

---

## File Storage Strategy

```
uploadFile (multer memoryStorage)
  │
  ├─ validateIncomingFile (MIME type, extension, size ≤ 25MB)
  │
  ├─ ensureStorageAvailable (plan-based limit check)
  │
  ├─ storeFile(file, workspaceId)
  │   │
  │   └─ storeRemotely(file, workspaceId)
  │       │
  │       ├─ Cloudinary configured? ──→ upload_stream → cloudinary.v2
  │       │                                │
  │       │                                └─ {url: "https://res.cloudinary.com/...",
  │       │                                   provider: "cloudinary"}
  │       │
  │       └─ No Cloudinary ──→ storeLocally
  │                               │
  │                               ├─ mkdir uploads/{workspaceId}/
  │                               ├─ writeFile (random name, original ext)
  │                               └─ {url: "/api/files/content/{wId}/{name}",
  │                                   provider: "local"}
  │
  ├─ FileAsset.create({url, storagePath, provider, ...})
  │
  └─ Response {file, attachment}
```

### URL Resolution

| Provider | Avatar URL | File URL |
|----------|-----------|----------|
| Cloudinary | `https://res.cloudinary.com/...` | `https://res.cloudinary.com/...` |
| Local | `/api/users/avatar/{name}` | `/api/files/content/{wId}/{name}` |

Production warning emitted when `NODE_ENV=production` and provider is `local`.

---

## Billing Pipeline

```
Frontend                         Server                       Razorpay
  │                               │                             │
  │──Click "Upgrade to Pro"──────>│                             │
  │                               │                             │
  │<──{plan info, price}─────────│                             │
  │                               │                             │
  │──POST /billing/create-order──>│                             │
  │   {planId}                    │──razorpay.orders.create()──>│
  │                               │<──{id, amount, currency}───│
  │<──{orderId, amount}──────────│                             │
  │                               │                             │
  │──Razorpay Checkout SDK───────│                             │
  │   (opens in frontend)        │                             │
  │                               │                             │
  │──User completes payment──────│                             │
  │                               │                             │
  │──POST /billing/verify────────>│                             │
  │   {razorpay_payment_id,      │                             │
  │    razorpay_order_id,         │                             │
  │    razorpay_signature}        │                             │
  │                               │──Verify signature──────────│
  │                               │──Subscription.create(pro)──│
  │                               │──BillingInvoice.create()───│
  │<──{success, subscription}────│                             │
```

---

## AI Integration

### Multi-Key Fallback
```
callGroq(messages, model)
  │
  ├─ keys = process.env.GROQ_API_KEY.split(',')
  │
  ├─ for each key:
  │   ├─ try:
  │   │   └─ groq.chat.completions.create({ key, messages, model })
  │   ├─ on error:
  │   │   ├─ log error
  │   │   ├─ 100ms delay
  │   │   └─ try next key
  │   └─ on success:
  │       └─ return response
  │
  └─ all keys exhausted → throw error
```

### Usage Tracking
Each AI request is logged to `AiUsage` with workspace, model, token count, and timestamp. The `aiUsageLimit.js` middleware enforces per-workspace quotas.

---

## Security Architecture

See [docs/SECURITY.md](docs/SECURITY.md) for the full security documentation.

**Summary of defensive layers:**

1. **Transport**: HTTPS enforced via Vercel/Render
2. **Authentication**: JWT with token versioning, httpOnly cookies
3. **Authorization**: Membership-based RBAC on every controller
4. **Input**: Zod validation + `sanitizeInput` stripping `<>{}$`
5. **Rate**: Global 500/15min + login 8/15min + AI usage quotas
6. **Headers**: Helmet with CSP, CORS whitelist
7. **Passwords**: bcrypt 12 rounds, SHA-256 reset tokens, 60-min expiry
8. **Session**: `tokenVersion` field for instant invalidation
9. **Error**: No stack traces in production, Sentry for debugging
10. **Secrets**: Zero env files in CI, all secrets via GitHub → Render/Vercel

---

## Deployment Topology

```
                    GitHub
                      │
              (push to main)
                      │
            ┌─────────┴─────────┐
            │                   │
       GitHub Actions      GitHub Actions
       (backend test)     (frontend build)
            │                   │
            ▼                   ▼
         Render              Vercel
     (auto-deploy)       (auto-deploy)
            │                   │
            ▼                   ▼
   https://dssync-hub-    https://dssync-hub-
   api.onrender.com      client.vercel.app
            │                   │
            └─────── CORS ──────┘
```

### Infrastructure Dependencies

| Service | Config | Cost |
|---------|--------|------|
| Vercel | Framework preset: Vite, Output: dist | Free tier |
| Render | Web Service, Node, Start: `node src/server.js` | Free tier (sleeps on idle) |
| MongoDB Atlas | M0 cluster (512MB storage) | Free tier |
| Cloudinary | Free tier (25GB storage, 25GB bandwidth) | Free tier |
| Sentry | Free tier (5k events/month) | Free tier |
| Redis (Upstash) | Free tier (100MB, 10k commands/day) | Free tier |
| GitHub Actions | Public repo: 2000 min/month | Free tier |

**Total running cost: $0/month** — all services offer generous free tiers.
