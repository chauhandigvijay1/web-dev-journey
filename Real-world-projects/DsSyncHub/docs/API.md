# API Reference

> Complete REST API reference for DsSync Hub. Base URL: `https://dssync-hub-api.onrender.com/api`

---

## Standard Response Format

### Success
```json
{ "success": true, "data": {}, "message": "..." }
```

### Error
```json
{ "success": false, "message": "Error description" }
```

---

## Authentication (`/api/auth`)

### Register
```
POST /auth/register
Body: { fullName, username, email, password }
→ 201: { success, user, token }
```

### Login
```
POST /auth/login
Body: { identifier, password }
→ 200: { success, user, token }
```

`identifier` accepts email, username, or phone.

### Google OAuth
```
POST /auth/google
Body: { credential }
→ 200: { success, user, token }
```

### Logout
```
POST /auth/logout
→ 200: { success }
```

### Forgot Password
```
POST /auth/forgot-password
Body: { email }
→ 200: { success, message }
```

### Reset Password
```
POST /auth/reset-password
Body: { token, password }
→ 200: { success, message }
```

### Send Verification Email
```
POST /auth/send-verification
Auth: required
→ 200: { success, message }
```

### Verify Email
```
POST /auth/verify-email/:token
→ 200: { success, message }
```

### Get Current User
```
GET /auth/me
Auth: required
→ 200: { success, user }
```

---

## Users (`/api/users`)

All endpoints require auth (except `GET /avatar/:filename`).

### Get Profile
```
GET /users/me
→ 200: { success, user }
```

### Update Profile
```
PATCH /users/profile
Body: { fullName?, username?, bio?, timezone? }
→ 200: { success, user }
```

### Update Account
```
PATCH /users/account
Body: { email?, phone?, backupEmail? }
→ 200: { success, user }
```

### Change Password
```
PATCH /users/security/password
Body: { currentPassword, newPassword }
→ 200: { success, message, forceLogout: true }
```

### Update Appearance
```
PATCH /users/appearance
Body: { theme?, accentColor?, compactMode? }
→ 200: { success, appearance }
```

### Upload Avatar
```
POST /users/avatar
Content-Type: multipart/form-data
Body: file (image, max 5MB)
Auth: required (no auth for GET)
→ 200: { success, user }

GET /users/avatar/:filename
→ File stream (public)
```

### Logout All Sessions
```
POST /users/logout-all
→ 200: { success, message }
```

---

## Workspaces (`/api/workspaces`)

### List Workspaces
```
GET /workspaces
Auth: required
→ 200: { success, workspaces[] }
```

### Create Workspace
```
POST /workspaces
Auth: required
Body: { name, description?, logoUrl?, plan? }
→ 201: { success, workspace, activity }
```

### Get Workspace Details
```
GET /workspaces/:id
Auth: required (must be member)
→ 200: { success, workspace }
```

### Update Workspace
```
PATCH /workspaces/:id
Auth: admin+
Body: { name?, description?, logoUrl?, plan? }
→ 200: { success, workspace }
```

### Archive Workspace
```
PATCH /workspaces/:id/archive
Auth: owner only
→ 200: { success }
```

### Join by Invite Code
```
POST /workspaces/:id/join
Auth: required
Body: { inviteCode }
→ 200: { success, workspace }
```

### Join by Code (any workspace)
```
POST /workspaces/join
Auth: required
Body: { inviteCode }
→ 200: { success, workspace }
```

### Invite Member
```
POST /workspaces/:id/invite
Auth: admin+
Body: { email, role? }
→ 200: { success, invite }
```

### List Members
```
GET /workspaces/:id/members
Auth: required (must be member)
→ 200: { success, members[] }
```

### Update Member Role
```
PATCH /workspaces/:id/members/:memberId
Auth: admin+
Body: { role }
→ 200: { success, activity }
```

### Remove Member
```
DELETE /workspaces/:id/members/:memberId
Auth: admin+
→ 200: { success, activity }
```

---

## Tasks (`/api/tasks`)

All endpoints require auth + workspace membership.

### List Tasks
```
GET /tasks?workspace=<id>
Query: workspace (required), status?, priority?, assignee?, search?
→ 200: { success, tasks[] }
```

### Create Task
```
POST /tasks
Body: { workspace, title, description?, status?, priority?, assignee?, dueDate? }
→ 201: { success, task, activity }
```

### Get Task
```
GET /tasks/:id
→ 200: { success, task }
```

### Update Task
```
PATCH /tasks/:id
Body: { title?, description?, status?, priority?, assignee?, dueDate? }
→ 200: { success, task, activity }
```

### Move Task Status
```
PATCH /tasks/:id/status
Body: { status }
→ 200: { success, task, activity }
```

### Delete Task
```
DELETE /tasks/:id
→ 200: { success, taskId, activity }
```

---

## Notes (`/api/notes`)

All endpoints require auth + workspace membership.

### List Notes
```
GET /notes?workspace=<id>
→ 200: { success, notes[] }
```

### Create Note
```
POST /notes
Body: { workspace, title?, content? }
→ 201: { success, note }
```

### Get Note
```
GET /notes/:id
→ 200: { success, note }
```

### Update Note
```
PATCH /notes/:id
Body: { title?, content? }
→ 200: { success, note }
```

### Delete Note
```
DELETE /notes/:id
→ 200: { success, noteId }
```

---

## Chat (`/api/chat`)

All endpoints require auth + workspace membership.

### Get Messages
```
GET /chat?workspace=<id>&channel=<id>
Query: workspace (required), channel?, limit?, before?
→ 200: { success, messages[] }
```

### Send Message
```
POST /chat/message
Body: { workspace, channel?, content, attachments? }
→ 201: { success, message }
```

### Edit Message
```
PATCH /chat/message/:id
Body: { content }
→ 200: { success, message }
```

### Delete Message
```
DELETE /chat/message/:id
→ 200: { success }
```

---

## Channels (`/api/channels`)

### List Channels
```
GET /channels?workspace=<id>
→ 200: { success, channels[] }
```

### Create Channel
```
POST /channels
Body: { workspace, name, description?, type? }
→ 201: { success, channel }
```

### Update Channel
```
PATCH /channels/:id
Body: { name?, description? }
→ 200: { success, channel }
```

### Delete Channel
```
DELETE /channels/:id
→ 200: { success }
```

---

## Calendar (`/api/calendar`)

All endpoints require auth + workspace membership.

### List Events
```
GET /calendar?workspace=<id>&start=<ISO>&end=<ISO>
→ 200: { success, events[] }
```

### Create Event
```
POST /calendar
Body: { workspace, title, description?, date, endDate?, allDay?, source?, color? }
→ 201: { success, event }
```

### Update Event
```
PATCH /calendar/:id
Body: { title?, description?, date?, endDate?, allDay?, color? }
→ 200: { success, event }
```

### Delete Event
```
DELETE /calendar/:id
→ 200: { success, eventId }
```

---

## Meetings (`/api/meetings`)

All endpoints require auth + workspace membership.

### List Meetings
```
GET /meetings?workspace=<id>
→ 200: { success, meetings[] }
```

### Create Meeting
```
POST /meetings
Body: { workspace, title, description?, startTime, endTime?, agenda? }
→ 201: { success, meeting }
```

### Get Meeting Room
```
GET /meetings/:id/room
→ 200: { success, meeting, roomName }
```

### Update Meeting
```
PATCH /meetings/:id
Body: { title?, description?, startTime?, endTime?, status? }
→ 200: { success, meeting }
```

### Delete Meeting
```
DELETE /meetings/:id
→ 200: { success }
```

---

## Files (`/api/files`)

All endpoints require auth + workspace membership.

### List Files
```
GET /files?workspace=<id>
→ 200: { success, files[] }
```

### List Recent Files
```
GET /files/recent?workspace=<id>&limit=<n>
→ 200: { success, files[] }
```

### Upload File
```
POST /files/upload
Content-Type: multipart/form-data
Body: file + workspace + source? + linkedEntityId?
→ 201: { success, file, attachment }
```

### Stream File
```
GET /files/content/:workspaceId/:filename
GET /files/content/:filename (backward compat)
Query: download=1
→ File stream
```

### Delete File
```
DELETE /files/:id
→ 200: { success, fileId }
```

---

## Billing (`/api/billing`)

### Get Current Plan
```
GET /billing/current
→ 200: { success, subscription, plan }
```

### Get Plans
```
GET /billing/plans
→ 200: { success, plans }
```

### Create Order
```
POST /billing/create-order
Body: { planId }
→ 200: { success, order }
```

### Verify Payment
```
POST /billing/verify
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
→ 200: { success, subscription }
```

### Get Invoices
```
GET /billing/invoices
→ 200: { success, invoices[] }
```

### Cancel Subscription
```
POST /billing/cancel
→ 200: { success, subscription }
```

---

## AI (`/api/ai`)

All endpoints require auth + workspace membership + AI usage quota.

### Summarize
```
POST /ai/summarize
Body: { workspace, text }
→ 200: { success, result }
```

### Rewrite
```
POST /ai/rewrite
Body: { workspace, text, tone? }
→ 200: { success, result }
```

### Generate Tasks
```
POST /ai/tasks
Body: { workspace, prompt }
→ 200: { success, tasks }
```

---

## Search (`/api/search`)

### Global Search
```
GET /search?workspace=<id>&q=<query>
Auth: required
→ 200: { success, results: { tasks, notes, users } }
```

---

## Notifications (`/api/notifications`)

### List Notifications
```
GET /notifications
Auth: required → 200: { success, notifications[] }
```

### Mark Read
```
PATCH /notifications/:id/read
Auth: required → 200: { success }
```

### Mark All Read
```
PATCH /notifications/read-all
Auth: required → 200: { success }
```

---

## Activity (`/api/activity`)

### List Activity
```
GET /activity?workspace=<id>
Auth: required → 200: { success, activity[] }
```

---

## Health

```
GET /api/health
→ 200: { status: "ok", service: "DsSync Hub API" }
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Missing/invalid auth token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Duplicate (email/username taken) |
| 429 | Rate limited |
| 500 | Server error |

---

## Socket Events

Connect: `wss://dssync-hub-api.onrender.com` with `auth: { token }`

### Client → Server
| Event | Payload | Module |
|-------|---------|--------|
| `chat:message` | `{ workspace, channel?, content }` | Chat |
| `chat:edit` | `{ messageId, content }` | Chat |
| `chat:delete` | `{ messageId }` | Chat |
| `typing:start` | `{ workspace, channel }` | Chat |
| `typing:stop` | `{ workspace, channel }` | Chat |
| `task:create` | `{ workspace, title, ... }` | Task |
| `task:update` | `{ taskId, ... }` | Task |
| `task:move` | `{ taskId, status }` | Task |
| `task:delete` | `{ taskId }` | Task |
| `note:create` | `{ workspace, title, content }` | Note |
| `note:update` | `{ noteId, ... }` | Note |
| `note:delete` | `{ noteId }` | Note |
| `calendar:create` | `{ workspace, title, date, ... }` | Calendar |
| `calendar:update` | `{ eventId, ... }` | Calendar |
| `calendar:delete` | `{ eventId }` | Calendar |

### Server → Client
| Event | Payload | Module |
|-------|---------|--------|
| `chat:message` | `{ ...message }` | Chat |
| `chat:edited` | `{ messageId, content }` | Chat |
| `chat:deleted` | `{ messageId }` | Chat |
| `typing:start` | `{ workspace, channel, user }` | Chat |
| `typing:stop` | `{ workspace, channel }` | Chat |
| `task:created` | `{ ...task }` | Task |
| `task:updated` | `{ ...task }` | Task |
| `task:moved` | `{ ...task }` | Task |
| `task:deleted` | `{ taskId }` | Task |
| `note:created` | `{ ...note }` | Note |
| `note:updated` | `{ ...note }` | Note |
| `note:deleted` | `{ noteId }` | Note |
| `calendar:created` | `{ ...event }` | Calendar |
| `calendar:updated` | `{ ...event }` | Calendar |
| `calendar:deleted` | `{ eventId }` | Calendar |
