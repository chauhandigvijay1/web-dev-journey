# Technical Challenges & Solutions

> The engineering problems we encountered building DsSync Hub, how we solved them, and what we learned.

---

## Table of Contents

1. [Real-Time Video Conferencing Without a Paid API](#1-real-time-video-conferencing-without-a-paid-api)
2. [Multi-Key AI API Fallback](#2-multi-key-ai-api-fallback)
3. [Ephemeral Storage on Render](#3-ephemeral-storage-on-render)
4. [Real-Time Calendar Persistence](#4-real-time-calendar-persistence)
5. [Sentry Middleware Ordering in Express 5](#5-sentry-middleware-ordering-in-express-5)
6. [File Upload Workspace Isolation](#6-file-upload-workspace-isolation)
7. [Concurrent Rich Text Editing Without Conflicts](#7-concurrent-rich-text-editing-without-conflicts)
8. [Email Deliverability From a Free Tier](#8-email-deliverability-from-a-free-tier)
9. [Avatar URL Resolution Across Storage Providers](#9-avatar-url-resolution-across-storage-providers)
10. [TypeScript Strict Mode With Dynamic Scripts](#10-typescript-strict-mode-with-dynamic-scripts)
11. [Multi-Tenant Data Leak Prevention](#11-multi-tenant-data-leak-prevention)
12. [Socket Security: Membership Verification on Every Event](#12-socket-security-membership-verification-on-every-event)
13. [Balancing Free Tier Generosity With Monetization](#13-balancing-free-tier-generosity-with-monetization)
14. [CI/CD Pipeline for Monorepo With Mixed Module Systems](#14-cicd-pipeline-for-monorepo-with-mixed-module-systems)

---

## 1. Real-Time Video Conferencing Without a Paid API

### The Problem
Teams need video meetings. Popular APIs like Zoom, Daily, and Agora require credit cards for basic usage. We needed a solution that was completely free (open source) and could be integrated in a single day.

### Investigation
- **Daily.co**: Free tier exists but limited to 10,000 minutes/month, requires credit card
- **Agora**: Free tier exists but requires credit card verification
- **LiveKit**: Self-hosted, powerful, but significant infrastructure overhead
- **Jitsi Meet**: 100% free, open source, no account required, no API keys needed

### Solution
Embedded Jitsi Meet using their client-side `external_api.js`:

```typescript
const script = document.createElement('script')
script.src = `https://meet.jit.si/external_api.js`
script.async = true
script.onload = () => {
  const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
    roomName: `DsSync_${roomId}`,
    width: '100%',
    height: '100%',
    userInfo: { displayName: user.fullName, email: user.email },
    configOverrides: {
      toolbarButtons: ['microphone', 'camera', 'desktop', 'chat', 'raisehand'],
    },
  })
}
```

### Challenges Encountered
1. **Dynamic script loading**: The Jitsi API is loaded via a `<script>` tag, not an npm package. We needed to handle the async load lifecycle and clean up on unmount.
2. **TypeScript typing**: `window.JitsiMeetExternalAPI` doesn't exist in TypeScript's type definitions. We added a global interface declaration.
3. **Cleanup**: When the user navigates away, we needed to properly destroy the Jitsi iframe. We used the `api.dispose()` method in the effect's cleanup function.

### Result
Users get HD video, audio, screen sharing, chat, and raise-hand features in a full-screen iframe. No credit card, no API key, no backend infrastructure.

---

## 2. Multi-Key AI API Fallback

### The Problem
Groq provides fast, free AI inference, but rate limits per API key are unpredictable. A single key can be exhausted during peak usage, breaking the AI assistant for all users.

### Investigation Options
1. **Single key with exponential backoff**: Simple but still fails under rate limits
2. **Queue system**: Over-engineered for the current user base
3. **Multiple keys with round-robin**: Most resilient, minimal complexity

### Solution
Comma-separated `GROQ_API_KEY` env var with sequential fallback:

```javascript
const keys = (process.env.GROQ_API_KEY || '').split(',').map((k) => k.trim()).filter(Boolean)

for (const key of keys) {
  try {
    const groq = new Groq({ apiKey: key })
    const response = await groq.chat.completions.create({ messages, model })
    return response
  } catch (error) {
    console.error(`Key failed: ${error.message}`)
    await new Promise((r) => setTimeout(r, 100))
    // try next key
  }
}
throw new Error('All API keys exhausted')
```

### Why This Works
- **Zero downtime**: If key A is rate-limited, key B handles the request transparently
- **Simple config**: DevOps can add/remove keys without code changes
- **Minimal cost**: Multiple free-tier Groq keys provide more aggregate throughput than a single paid plan
- **No dependencies**: Pure logic, no Redis/cache needed for the basic case

---

## 3. Ephemeral Storage on Render

### The Problem
Render's free tier uses ephemeral filesystem storage. Any file uploaded to `server/uploads/` — avatars, chat attachments, task files — is permanently deleted on every deploy or service restart. For a production SaaS, this is unacceptable.

### Investigation
Render's documentation is clear: "Any data written to the local filesystem will be lost when your service restarts." We needed cloud storage.

### Options Considered
1. **AWS S3**: Industry standard, but requires AWS account + credit card
2. **Supabase Storage**: Generous free tier (1GB), but another service to manage
3. **Cloudinary**: 25GB free storage, 25GB free bandwidth, image transformations included, no credit card for basic tier

### Solution
Integrated Cloudinary as the primary storage provider with automatic local fallback:

```
storeFile(file, workspaceId)
  └─ storeRemotely(file, workspaceId)
      ├─ Cloudinary configured → upload_stream → secure_url
      └─ No Cloudinary → storeLocally (with production console.warn)
```

**Cloudinary advantages:**
- Image transformations via URL parameters (`/c_fill,w_300,h_300/`)
- CDN delivery (fast global load times)
- Generous free tier that doesn't expire

---

## 4. Real-Time Calendar Persistence

### The Problem
The original calendar was purely Redux-local — events lived in browser memory. A page refresh wiped all events. Users couldn't share calendars across devices, and the feature was essentially a demo shell.

### Investigation
The codebase had 16 Redux slices, including a `calendarSlice` that stored events in-memory. There was no backend model, no API routes, no database persistence.

### Solution
Built a complete backend persistence layer:

1. **CalendarEvent Mongoose model** with workspace scoping, date indexing, source tracking
2. **calendarController.js** with list (date-range filter), create, update, delete — all with membership checks
3. **calendarRoutes.js** at standard REST paths
4. **calendarApi.ts** frontend service for API calls
5. **calendarSlice.ts** refactored with `createAsyncThunk` for backend persistence
6. **useCalendarSocket.ts** hook for real-time sync across clients
7. **calendarSocket.js** broadcasting `calendar:created/updated/deleted` to workspace rooms

### Result
Events survive page refresh, sync across team members in real time, and maintain the same UX as before.

---

## 5. Sentry Middleware Ordering in Express 5

### The Problem
Sentry's documentation requires its `requestHandler` to run **before** all route handlers. Our initial implementation initialized Sentry inside `server.js` after `app.js` (with routes) was already imported, making the request handler ineffective.

### Diagnosis
```javascript
// server.js — WRONG ORDER
const app = require('./app')  // routes already registered
app.use(Sentry.Handlers.requestHandler())  // added AFTER routes — too late!
```

### Solution
Moved Sentry initialization into `app.js` at the correct positions:

```javascript
// app.js — CORRECT ORDER
// After middleware, before routes
if (Sentry) {
  app.use(Sentry.Handlers.requestHandler())
}

// ... routes ...

// After routes, before error handlers
if (Sentry) {
  app.use(Sentry.Handlers.errorHandler())
}

app.use(notFoundHandler)
app.use(errorHandler)
```

This required making `Sentry` a top-level variable initialized conditionally before the route imports run, since the `Sentry.init()` call is side-effect free and can happen at module load time.

---

## 6. File Upload Workspace Isolation

### The Problem
Files were uploaded to a flat `uploads/` directory. With multiple workspaces and hundreds of users, this created:
- **Collision risk**: Two users in different workspaces could upload files with the same name
- **No isolation**: Hard to implement per-workspace storage quotas
- **Poor organization**: No way to clean up a workspace's files on deletion

### Solution
Changed the storage path pattern from:
```
uploads/filename.ext
```
to:
```
uploads/{workspaceId}/{timestamp}-{random}-{sanitized-name}.ext
```

Updated the URL pattern:
```
/api/files/content/{workspaceId}/{filename}
```

With a backward-compatible fallback route:
```javascript
router.get('/content/:workspaceId/:filename', streamFileContent)
router.get('/content/:filename', streamFileContent)
```

The FileAsset model stores the absolute `storagePath` so file deletion works regardless of the path pattern.

---

## 7. Concurrent Rich Text Editing Without Conflicts

### The Problem
The `NoteEditor` component used `document.execCommand()` for rich text formatting (bold, italic, links). This API is deprecated, behaves differently across browsers, and provides no mechanism for concurrent editing awareness.

### Investigation
`execCommand` has been deprecated by the W3C and is being removed from browsers. The app needed a replacement that could also handle real-time collaboration.

### Solution
1. **Feature detection**: Wrapped all `execCommand` calls with `document.queryCommandSupported()` guard
2. **DOM API fallback**: For link insertion, used native DOM `document.createElement` and `Selection` API instead of `execCommand('createLink')`
3. **Socket broadcast**: Notes are broadcast via Socket.io on save, so all connected clients receive updates via `note:updated` events

```typescript
if (document.queryCommandSupported('bold')) {
  document.execCommand('bold', false)
} else {
  // DOM API fallback for link creation
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const link = document.createElement('a')
  link.href = url
  link.textContent = text
  range.deleteContents()
  range.insertNode(link)
}
```

This ensures the editor works now and continues working as browsers phase out `execCommand`.

---

## 8. Email Deliverability From a Free Tier

### The Problem
The app sends three types of emails (password reset, email verification, workspace invites). Using a raw SMTP server or `sendmail` would land in spam folders. Paid services like SendGrid and Mailgun require credit cards.

### Solution
**Gmail App Passwords** with Nodemailer:

```javascript
transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,  // 16-char app password
  },
})
```

**Why it works:**
- Gmail's SMTP servers have excellent deliverability
- App passwords are free and don't expire unless revoked
- The app uses HTML templates with inline styles for consistent rendering
- `EMAIL_FROM` is configurable separately from `EMAIL_USER`

**HTML Template Design:**
Each email has a styled template with:
- Clear visual hierarchy (heading → body → CTA button → footer)
- Inline CSS (no `<style>` block for email client compatibility)
- Plain-text fallback for clients that block HTML
- Single clear call-to-action button

---

## 9. Avatar URL Resolution Across Storage Providers

### The Problem
Avatar uploads always set `user.avatarUrl` to a hardcoded local path regardless of whether Cloudinary was used:

```javascript
// OLD — always points to local server
user.avatarUrl = `/api/users/avatar/${stored.name}`
```

When Cloudinary was configured, the avatar was uploaded to Cloudinary but the URL still pointed to the local server, which would return 404 (or a stale file on Render's ephemeral storage).

### Solution
Route through `stored.url` which dynamically provides the correct URL:

```javascript
const stored = await storeFile(req.file, null)
user.avatarUrl = stored.url.startsWith('http')
  ? stored.url        // Cloudinary URL → serve from CDN
  : `/api/users/avatar/${stored.name}`  // Local path → serve via Express
```

This check works because:
- Cloudinary returns `https://res.cloudinary.com/...`
- Local storage returns `/api/files/content/{name}`

The `serveAvatar` endpoint continues to serve locally-stored avatars for backward compatibility.

---

## 10. TypeScript Strict Mode With Dynamic Scripts

### The Problem
TypeScript strict mode (`strict: true` in `tsconfig.json`) caught every untyped window property. The Jitsi Meet script (loaded dynamically) adds `window.JitsiMeetExternalAPI`, which TypeScript doesn't know about:

```typescript
// ERROR: Property 'JitsiMeetExternalAPI' does not exist on type 'Window & typeof globalThis'
new window.JitsiMeetExternalAPI(domain, options)
```

### Solution
Added a global interface declaration at the top of `MeetingRoomPage.tsx`:

```typescript
declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => {
      addEventListener: (event: string, handler: () => void) => void
      dispose?: () => void
    }
  }
}
```

This declaration is scoped to the component file (not global) and provides full type safety for the Jitsi API methods we use. TypeScript strict mode now passes with 0 errors.

---

## 11. Multi-Tenant Data Leak Prevention

### The Problem
In a multi-tenant SaaS, a user from Workspace A must never see data from Workspace B. With 15 controllers and 17 models, a single missing membership check could expose sensitive data.

### Investigation
We audited every controller endpoint for workspace membership verification. The audit covered:
- All 15 controllers (auth, user, workspace, task, note, chat, channel, calendar, meeting, file, billing, ai, search, notification, activity)
- Socket event handlers (chat, task, note, calendar)
- File upload and access endpoints

### Findings
- **4 socket handlers were missing membership checks**: typing indicators and message edit/delete events could be triggered by non-members
- **File uploads had no workspace directory isolation**: files from different workspaces mixed in a single directory
- **All 15 controllers had correct REST membership checks**: zero vulnerabilities

### Fixes Applied
1. Socket handlers now verify workspace membership before processing events
2. File storage uses `uploads/{workspaceId}/` subdirectories
3. File URL pattern changed to include workspaceId

---

## 12. Socket Security: Membership Verification on Every Event

### The Problem
Socket.io events bypass the Express middleware chain. A malicious client could listen to any workspace room if they knew the room naming convention. Our socket handlers trusted the client's `workspaceId` without verifying membership.

### Vulnerable Pattern
```javascript
// OLD — trusts client-sent workspaceId
socket.on('chat:message', (data) => {
  io.to(`workspace:${data.workspaceId}`).emit('chat:message', data)
})
```

### Fixed Pattern
```javascript
// NEW — verifies membership before broadcasting
socket.on('chat:message', async (data) => {
  const membership = await Membership.findOne({
    user: socket.userId,
    workspace: data.workspaceId,
    status: 'active',
  })
  if (!membership) return

  const message = await Message.create({ ...data, sender: socket.userId })
  io.to(`workspace:${data.workspaceId}`).emit('chat:message', message)
})
```

This pattern is now applied to all 4 socket modules across all 15 event types.

---

## 13. Balancing Free Tier Generosity With Monetization

### The Problem
We needed a billing system that works (real payment processing) but doesn't break the user experience. The app has a Free plan and a Pro plan. Features and storage limits must be enforced server-side.

### Solution
Razorpay integration with plan-based limits:

```javascript
// planLimits.js
const PLAN_LIMITS = {
  free: { storageLimitMb: 512, maxMembers: 10, maxWorkspaces: 3, aiRequestsPerDay: 50 },
  pro: { storageLimitMb: 10240, maxMembers: 100, maxWorkspaces: 50, aiRequestsPerDay: 1000 },
}
```

**The billing pipeline:**
1. User clicks "Upgrade to Pro" → frontend requests order from backend
2. Backend creates Razorpay order with pricing
3. Frontend opens Razorpay Checkout SDK
4. User completes payment → frontend sends verification payload to backend
5. Backend verifies Razorpay signature → creates Subscription document
6. Workspace plan upgrades → new limits apply instantly

The free tier is generous enough to be genuinely useful (512MB storage, 10 members, 3 workspaces) but constrained enough to create upgrade motivation.

---

## 14. CI/CD Pipeline for Monorepo With Mixed Module Systems

### The Problem
The project is a monorepo with:
- `client/`: TypeScript + Vite (ES modules)
- `server/`: CommonJS (Node.js `require`)
- Different build steps, different test runners, different lint configurations

### Solution
GitHub Actions workflow with parallel jobs:

```yaml
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    defaults:
      working-directory: ./server
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test

  frontend-build:
    runs-on: ubuntu-latest
    defaults:
      working-directory: ./client
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build
```

**Key decisions:**
- Both jobs run in parallel (not sequential) for faster feedback
- `npm install` is not cached (simplicity over optimization for early stages)
- Backend tests use Node's built-in `--test` runner (zero dependencies)
- Frontend build includes `tsc -b` (TypeScript compilation) before `vite build`
- Secrets are injected via GitHub Secrets, not `.env` files
