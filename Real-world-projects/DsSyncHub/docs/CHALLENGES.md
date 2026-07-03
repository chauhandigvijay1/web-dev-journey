<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Technical Challenges & Solutions</h1>
</div>

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
15. [Socket Singleton Disconnect — Real-Time Drops for All Features](#15-socket-singleton-disconnect--real-time-drops-for-all-features)
16. [Chat Message Double-Send From Dual REST + Socket Paths](#16-chat-message-double-send-from-dual-rest--socket-paths)
17. [Invite Acceptance Flow — Missing Frontend and Backend Routes](#17-invite-acceptance-flow--missing-frontend-and-backend-routes)
18. [Missing Socket Hooks — Task and Note Real-Time Was Dead Code](#18-missing-socket-hooks--task-and-note-real-time-was-dead-code)
19. [Billing: Razorpay Load Order, Missing Config, and Coupon Validation](#19-billing-razorpay-load-order-missing-config-and-coupon-validation)

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
The app sends three types of emails (password reset, email verification, workspace invites). Using a raw SMTP server or `sendmail` would land in spam folders. Paid services like SendGrid and Mailgun require credit cards. Additionally, Render's free tier blocks SMTP ports (465, 587), and Resend's free tier only allows sending to the owner's own email (no custom domain support).

### Three Attempts to Solve This

**Attempt 1 — Gmail App Passwords (Nodemailer SMTP)**
```javascript
transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})
```
This worked locally but failed on Render because port 587 is blocked.

**Attempt 2 — Resend HTTP API (port 443)**
Switched to Resend's REST API over HTTPS (`fetch()` to `https://api.resend.com`), which bypasses SMTP port blocking. Emails worked for the owner's address but failed for external recipients because Resend's free tier requires a custom domain to send to unverified addresses.

**Attempt 3 (Final) — SendGrid HTTP API with multi-provider fallback**
```javascript
async function sendEmail({ to, subject, html }) {
  // Primary: SendGrid HTTP API (port 443)
  const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${trim(EMAIL_PASS)}` },
    body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], from: { email: from }, subject, content: [{ type: 'text/html', value: html }] }),
  })
  // Fallback 1: Resend HTTP API
  // Fallback 2: Nodemailer SMTP (465 → 587)
}
```

**Why it works:**
- SendGrid free tier (100 emails/day) allows sending to any verified recipient
- HTTP API on port 443 works through Render's network restrictions
- All env vars are trimmed with a `trim()` helper to handle trailing whitespace issues
- Three fallback providers ensure delivery even if one service is down

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
  - stored.url        // Cloudinary URL → serve from CDN
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
  i*to(`workspace:${data.workspaceId}`).emit('chat:message', data)
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
  i*to(`workspace:${data.workspaceId}`).emit('chat:message', message)
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
  free: { storageLimitMb: 512, maxMembers: 5, maxWorkspaces: 1, aiRequestsPerDay: 10 },
  pro: { storageLimitMb: 10240, maxMembers: 100, maxWorkspaces: 50, aiRequestsPerDay: 300 },
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

---

## 15. Socket Singleton Disconnect — Real-Time Drops for All Features

### The Problem
After visiting the Chat page, ALL real-time events across the app stopped working — task updates, note changes, calendar sync. Even chat itself stopped receiving messages after the first page load. All 4 socket modules went silent.

### Root Cause
`useChatSocket.ts` had this cleanup function:
```typescript
useEffect(() => {
  // ... setup ...
  return () => {
    socket.off('message_received', handler)
    disconnectSocket()  // ← THIS LINE
  }
}, [workspaceId])
```

The `disconnectSocket()` call from the `socket.ts` singleton service:
```typescript
export const disconnectSocket = () => {
  if (socketRef.current) {
    socketRef.current.disconnect()
    socketRef.current = null
  }
}
```

This disconnected the **global singleton** socket. Every other hook (`useTaskSocket`, `useNoteSocket`, `useCalendarSocket`) was using the same socket instance. Once it was disconnected, no feature could receive real-time events.

### Why It Wasn't Caught
1. **Chat works on first visit**: The effect runs, connects the socket, and messages flow. Only on **unmount** (navigating away) does the disconnect happen.
2. **Task/Note real-time was never initialized**: `useTaskSocket` and `useNoteSocket` hooks were defined but never called in TasksPage or NotesPage, so nobody noticed they were broken.
3. **CalendarPage loads last**: Users might visit Dashboard → Chat → Tasks → Notes → Calendar, by which point the socket was long disconnected.

### Solution
```typescript
// useChatSocket.ts — fixed
useEffect(() => {
  connectSocket(token)
  // ... setup handlers ...
  return () => {
    socket.off('message_received', handler)
    socket.emit('leave_workspace', workspaceId)  // ← leave room only
    // NO disconnectSocket() — let other features use the socket
  }
}, [workspaceId, token])
```

### Lesson Learned
A singleton socket must never be disconnected by a single feature's cleanup. Components should only remove their own event listeners and leave rooms. Socket lifecycle (connect/disconnect) must be managed at the app level, not the component level.

---

## 16. Chat Message Double-Send From Dual REST + Socket Paths

### The Problem
Every chat message was appearing **twice** in the database and in the UI. Both text messages and file uploads were duplicated.

### Root Cause
The chat system had **two independent write paths** that both created Messages in the database:

**Path 1 — REST (via Redux thunk):**
```
ChatPage.sendMessage → dispatch(sendMessageThunk(payload))
  → chatApi.sendMessage(payload) → POST /api/chat/messages
  → chatController.createMessage → Message.create() in DB
```

**Path 2 — Socket (via direct emit):**
```
ChatPage.sendMessage → socket.emit('send_message', payload)
  → chatSocket.js 'send_message' handler → Message.create() in DB
```

Both ran on every message send. The Redux thunk handled the API call AND immediately emitted a socket event that also persisted to the DB.

### Solution
Three changes were made:

1. **REST becomes the single write path**: `chatController.createMessage` now broadcasts `message_received` via `req.app.get('io')` after creating the message in DB
2. **Socket handler stripped**: The `send_message` handler in `chatSocket.js` no longer creates Messages — it's a no-op relay (or could be removed entirely)
3. **Frontend emits removed**: Both the text send handler and file upload handler in ChatPage no longer have the redundant `socket.emit('send_message', payload)` line

```javascript
// server.js — Attach io to Express app
app.set('io', io)

// chatController.js — REST creates + broadcasts
const message = await Message.create({ ... })
req.app.get('io').to(`workspace:${workspaceId}`).emit('message_received', message)

// chatSocket.js — no-op relay (backward compat)
socket.on('send_message', (data) => {
  // Message is created by REST controller; this is a no-op
})
```

This ensures exactly one DB write per message, with real-time broadcast regardless of whether the REST or socket path was triggered.

---

## 17. Invite Acceptance Flow — Missing Frontend and Backend Routes

### The Problem
Workspace invite emails contained a link like `https://dssync-hub-client.vercel.app/join-workspace/:token`. Clicking this link showed a blank page (React Router 404) because no route existed for that path. Even if a route existed, there was no backend endpoint to resolve the invite token.

### Root Cause
The invite system had two parts:
1. **Invite creation**: Working — `POST /api/workspaces/:id/invite` created an Invite document and sent an email
2. **Invite acceptance**: Missing entirely — no frontend route, no backend endpoint, no joining logic

### Solution
Built the complete acceptance flow:

**Backend:** `POST /api/workspaces/join-with-token`
```javascript
async joinWorkspaceByToken(req, res) {
  const invite = await Invite.findOne({ token: req.body.token, used: false, expiresAt: { $gt: new Date() } })
  if (!invite) return res.status(400).json({ message: 'Invalid or expired invite token' })
  
  let membership = await Membership.findOne({ user: req.user._id, workspace: invite.workspace })
  if (!membership) {
    membership = await Membership.create({ user: req.user._id, workspace: invite.workspace, role: 'member' })
  }
  if (!membership.active) {
    membership.active = true; await membership.save()
  }
  invite.used = true; await invite.save()
  
  await ActivityLog.create({ ... })
  res.json({ message: 'Joined workspace successfully', workspace: invite.workspace })
}
```

**Frontend:** `JoinWorkspaceWithTokenPage.tsx`
```typescript
const JoinWorkspaceWithTokenPage = () => {
  const { token } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  useEffect(() => {
    const acceptInvite = async () => {
      const result = await dispatch(joinWithTokenThunk(token)).unwrap()
      await dispatch(fetchWorkspacesThunk())  // refresh sidebar
      localStorage.setItem('dssync-active-workspace', result.workspace._id)
      navigate(`/dashboard/${result.workspace._id}/chat`)  // hard-navigate
    }
    acceptInvite()
  }, [token])
}
```

**Route registration:**
```typescript
<Route path="/join-workspace/:token" element={<ProtectedRoute><JoinWorkspaceWithTokenPage /></ProtectedRoute>} />
```

The key insight was that after accepting an invite, we needed to:
1. Refresh the workspace list so the new workspace appears in the sidebar
2. Set the active workspace in localStorage so subsequent module navigations work
3. Hard-navigate (not just `navigate()`) to force Redux re-initialization with the correct workspace context

---

## 18. Missing Socket Hooks — Task and Note Real-Time Was Dead Code

### The Problem
Task and note operations (create, update, delete) were NOT updating in real time across connected clients. Users had to manually refresh to see changes made by teammates.

### Root Cause
The codebase had 4 socket hooks defined:
- `useChatSocket.ts` — used in ChatPage ✅
- `useTaskSocket.ts` — **never imported anywhere** ❌
- `useNoteSocket.ts` — **never imported anywhere** ❌
- `useCalendarSocket.ts` — used in CalendarPage ✅

Both `useTaskSocket` and `useNoteSocket` were created during the initial socket infrastructure build but were never integrated into their respective pages. The hooks, socket event handlers, and Redux listeners all existed — they just weren't wired together.

### Solution
Added the missing hook calls:

```typescript
// TasksPage.tsx
const TasksPage = () => {
  useTaskSocket()  // ← was missing
  // ... rest of component
}

// NotesPage.tsx
const NotesPage = () => {
  useNoteSocket()  // ← was missing
  // ... rest of component
}
```

### Lesson Learned
When building infrastructure (sockets, shared hooks, services), always verify that the consuming code actually calls the new API before marking the task complete. Dead code is worse than no code — it creates a false sense of security.

---

## 19. Billing: Razorpay Load Order, Missing Config, and Coupon Validation

### The Problem
The billing system had three distinct issues:

1. **Razorpay load-order failure**: `const razorpay = new Razorpay({ ... })` ran at module load time, before env vars were fully initialized. This caused `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to be `undefined`, and trailing whitespace in `.env` values caused silent auth failures.

2. **No configuration visibility**: Users couldn't tell if billing was properly configured. If Razorpay keys were missing or misconfigured, the "Upgrade" button would silently fail with no feedback.

3. **No coupon/ promo system**: The only way to upgrade was through Razorpay payment. No mechanism existed for granting Pro access via coupon codes (useful for beta testers, sponsors, or internal team members).

### Solutions

**1. Lazy Razorpay initialization with trimming:**
```javascript
function getRazorpayClient() {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim()
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
  if (!keyId || !keySecret) return null
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}
```

**2. Billing config endpoint:**
```javascript
// GET /api/billing/config
async billingConfig(req, res) {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim()
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
  const ownerCoupon = (process.env.OWNER_COUPON_CODE || '').trim()
  res.json({
    razorpayConfigured: !!(keyId && keySecret),
    hasRazorpayKeyId: !!keyId,
    hasRazorpayKeySecret: !!keySecret,
    hasOwnerCoupon: !!ownerCoupon,
    provider: 'razorpay',
  })
}
```

Frontend uses this to show status badges ("Razorpay configured" / "Razorpay not configured"), disable checkout buttons, and show appropriate messages.

**3. Coupon code system:**
```javascript
// POST /api/billing/apply-coupon
async applyCoupon(req, res) {
  const { workspaceId, code } = req.body
  const OWNER_COUPON = (process.env.OWNER_COUPON_CODE || '').trim()
  
  if (!OWNER_COUPON || code !== OWNER_COUPON) {
    return res.status(400).json({ message: 'Invalid coupon code' })
  }
  
  const workspace = await Workspace.findById(workspaceId)
  workspace.plan = 'pro'
  await workspace.save()
  
  return res.json({ message: 'Coupon applied! Workspace upgraded to Pr*', plan: 'pro' })
}
```

### Result
- Razorpay errors from trailing whitespace and load-order are eliminated
- Users see clear status indicators for billing configuration
- Coupon codes enable direct Pro upgrades without payment, useful for testing and promotions

---

<div align="center">
  <a href="../README.md">🏠 Home</a>
</div>
