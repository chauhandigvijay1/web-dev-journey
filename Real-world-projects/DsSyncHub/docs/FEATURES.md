# DsSync Hub - Features Documentation

This document explains all major features available in DsSync Hub.

---

## Product Overview

DsSync Hub is a modern collaboration platform designed for teams, freelancers, startups, and productivity-focused users.

It combines task management, notes, real-time communication, video meetings, AI assistance, workspace management, payments, and secure authentication in one application.

---

## Authentication System

Secure and user-friendly authentication flows.

### Features Included

- Email/password registration (bcrypt 12 rounds)
- Email/username/phone login
- Google OAuth 2.0 (Google Identity Services)
- Forgot/reset password flow (SHA-256 tokens, 60-min expiry)
- Email verification flow with dedicated VerifyEmailPage
- JWT authentication with token versioning (session invalidation)
- httpOnly cookies (sameSite=none in production)
- Rate-limited login (8 attempts per 15 minutes)
- Protected routes via ProtectedRoute/GuestRoute
- Logout all sessions (tokenVersion increment)

---

## Workspace Management

Multi-tenant workspace architecture with full CRUD.

### Features Included

- Create, rename, delete, archive workspaces
- Unique slug + inviteCode per workspace
- Plan enforcement: Free=1 workspace, Pro=unlimited
- Member management with 4 roles: owner, admin, member, viewer
- Invite by email (real HTML email with secure 7-day token)
- Join by invite code or invite token link
- Duplicate prevention
- Owner-only archive
- Pending member display with amber/green badges and Cancel button

---

## Dashboard

Central productivity dashboard after login.

### Includes

- Welcome section with workspace name
- Quick stats cards (tasks, members, storage)
- Tasks summary by status
- Recent activity feed
- Quick action buttons

---

## Task Management

Full Kanban-style task system for team productivity.

### Features Included

- Create, edit, delete tasks
- Title, description, status, priority, due date
- Status flow: todo, in-progress, review, done
- Priority levels: low, medium, high, critical
- Assignee assignment with notifications
- Up to 8 labels per task
- Task comments with mentions and notifications
- File attachments on tasks
- Move task (drag-drop status changes)
- Complete and archive (soft-delete)
- Filters and search
- Real-time sync via Socket.io (create, update, move, delete)

---

## Notes Module

Rich content documentation with sharing.

### Features Included

- Create, edit, delete notes
- Rich text content with XSS sanitization
- Tags, folders, cover image, icon
- Pin/unpin, archive/unarchive, duplicate
- Public sharing via unique sharedToken (no auth required)
- Version tracking (+1 per update)
- Text search index on title + plainText
- Real-time sync via Socket.io (create, update, delete)

---

## Team Chat

Real-time messaging with channels and direct messages.

### Features Included

- Channel-based messaging with unique slug per workspace
- Direct messaging between workspace members
- Real-time message sending with Socket.io
- Typing indicators
- Message edit and soft-delete
- Emoji reactions with user array tracking
- Reply-to threading
- SeenBy tracking
- File attachments (drag-and-drop upload)
- Mentions detection with notifications
- Online presence tracking

---

## Calendar

Persisted calendar with multiple views.

### Includes

- Event CRUD (title, description, date range, all-day, color)
- Date-range queries for efficient loading
- Month, week, and agenda views
- Task due dates merged with calendar events
- Color coding per event
- Linked entity tracking (source + linkedEntityId)
- Real-time sync via Socket.io (create, update, delete)
- All events survive page refresh (MongoDB persisted)

---

## Meetings (Jitsi Meet)

Real video meetings with no account required.

### Features Included

- Room CRUD with unique 8-character roomId
- Status tracking: upcoming, live, ended
- Participant tracking
- Full Jitsi Meet iframe integration (meet.jit.si)
- HD video/audio, screen sharing, in-call chat
- Raise hand, background blur
- Role-based access: owner/admin/member can create, all can join

---

## Billing & Subscription

Monetization with Razorpay payment gateway.

### Features Included

- Free / Pro Monthly (Rs. 999) / Pro Yearly (Rs. 9,999) tiers
- 9-row feature comparison table (workspaces, members, storage, AI/day, upload, channels, support, branding, API)
- Razorpay checkout with HMAC SHA-256 signature verification
- Subscription lifecycle: create, cancel, resume
- Coupon code system (direct Pro upgrade, bypasses Razorpay)
- Razorpay config endpoint + UI status badges
- Role-aware billing UI (non-admin warning + disabled checkout)
- Usage display: members, AI calls, storage vs. plan limits
- Invoice tracking with downloadable URLs

---

## AI Assistant (Groq)

AI-powered productivity features.

### Features Included

- Groq API (llama-3.1-8b-instant, 0.4 temperature)
- 6 functions:
  - Summarize notes
  - Improve writing
  - Convert text to tasks
  - Summarize chat messages
  - Sprint planning
  - Task prioritization
- Daily usage limits: Free=10, Pro Monthly=300, Pro Yearly=500
- 12-second timeout with silent fallback on failure

---

## File Management

Upload and manage files.

### Features Included

- Multer memoryStorage (25MB limit, 29 MIME types)
- Local storage: `uploads/{workspaceId}/{filename}`
- Cloudinary storage with automatic fallback
- Per-plan storage quotas with enforcement
- File listing, streaming/download, delete
- Drag-and-drop file upload in chat

---

## Search

Global search across modules.

### Features Included

- Workspace-scoped regex search
- Searches tasks, notes, messages, members, files
- Debounced search support

---

## Notifications

Central notification system.

### Features Included

- Types: task_assigned, mention, invite, due_reminder, note_shared, payment, system
- List (latest 100)
- Mark read, mark all read, delete
- Unread count badge

---

## Activity Log

Track all workspace changes.

### Features Included

- Entity types: task, note, message, workspace, member, billing, file, meeting
- Timeline view with actor population
- Last 150 entries

---

## Admin Panel

Platform-wide administration.

### Features Included

- Statistics dashboard (users, workspaces, active subscriptions)
- User management: search, pagination, role promote/demote, delete
- Workspace list with member counts and plan badges
- Admin-only access (role check middleware)

---

## Data Export

GDPR-compliant data export.

### Features Included

- One-click ZIP download of all workspace data
- Includes: workspace.json, tasks.json, notes.json, messages.json, calendar.json, files.json
- Uses adm-zip streaming with Content-Disposition header

---

## Settings & Account

Profile and preferences management.

### Profile

- Full name, username, bio
- Avatar upload (local or Cloudinary)

### Security

- Change password
- Session management (logout all)

### Appearance

- Theme: light, dark, system
- Accent color picker
- Compact mode toggle

---

## Security Features

- Password hashing (bcrypt, 12 rounds)
- JWT token auth with tokenVersion
- Input sanitization (strips `<>{}&$` across all inputs)
- Note content XSS sanitization (strips scripts/styles/iframes/event handlers)
- Rate limiting: global (500/15min) + auth (8/15min)
- Helmet security headers
- CORS whitelist
- httpOnly cookies with sameSite
- No stack traces in production errors
- Parameterized queries via Mongoose

---

## Infrastructure Features

- Pino structured logging (configurable levels, redaction, serializers)
- Redis: rate limiting + Socket.io adapter + Bull queue (all guarded)
- Sentry error monitoring (guarded when DSN unset)
- Cloudinary media storage (falls back to local)
- Bull email queue with 3 retries (falls back to direct send)
- Cron: expired token cleanup every 6 hours
- CI/CD: GitHub Actions (92 tests + frontend build on push/PR)
- API versioning: all routes at `/api` and `/api/v1`
- Socket.io: 4 modules (chat, task, note, calendar) with JWT auth

---

## Responsive Design

Built for all screen sizes: mobile, tablet, laptop, desktop.

---

## Use Cases

- Startups
- Small teams
- Student teams
- Freelancers
- Portfolio showcase
- Productivity management
- Internal collaboration

---

## Summary

DsSync Hub is more than a CRUD project. It is a full-stack SaaS collaboration product demonstrating real engineering, product design thinking, integrations, and scalable architecture.
