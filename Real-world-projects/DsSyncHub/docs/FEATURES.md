<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Features & Capabilities</h1>
  <p><strong>A comprehensive overview of the platform's core functional domains and underlying engineering.</strong></p>
</div>

---

## Product Overview

DsSync Hub is a modern, enterprise-grade collaboration platform designed for fast-moving teams, startups, and productivity-focused users.

It merges task tracking, rich-text documentation, real-time messaging, video conferencing, generative AI assistance, and Razorpay monetization into a single, cohesive ecosystem.

---

## 🔒 Enterprise Authentication

A robust, defense-in-depth authentication pipeline designed for seamless onboarding and maximum security.

- **Dual-Strategy Login**: Support for traditional Email/Password (hashed via bcrypt 12 rounds) alongside **Google OAuth 2.0** Identity integration.
- **Secure Sessions**: JWT authentication utilizing strict token versioning to allow instant "Logout All Sessions" functionality.
- **Recovery & Verification**: Automated Email Verification flows and Forgot/Reset Password flows powered by SHA-256 tokens with strict 60-minute expiries.
- **Hardened Defenses**: Rate-limited login (8 attempts per 15 minutes), httpOnly secure cookies, and strict Protected/Guest route guarding.

---

## 🏢 Multi-Tenant Workspaces

The core architectural boundary of the platform. Data is strictly segregated via multi-tenancy.

- **Full Lifecycle Management**: Create, rename, delete, and archive workspaces (Archive restricted to Owners).
- **Plan Enforcement**: Dynamic quota enforcement (Free tier = 1 workspace, Pro tier = Unlimited).
- **Granular RBAC**: Four distinct member roles (Owner, Admin, Member, Viewer) dictating access across the entire platform.
- **Seamless Onboarding**: Invite users via rich HTML emails containing secure 7-day tokens, or utilize shareable Workspace Invite Codes.

---

## 💬 Real-Time Communication

A high-performance WebSocket messaging system ensuring zero-latency team communication.

- **Singleton Architecture**: Engineered using `socket.io` to ensure stable, single-instance connectivity.
- **Channel Dynamics**: Support for public `#general` channels and private 1-on-1 Direct Messaging.
- **Rich Messaging**: Messages support file attachments (images, PDFs), mentions (`@username`), and threaded replies.
- **Live UI Indicators**: Real-time "Typing..." indicators and online/offline presence tracking.

---

## 📊 Agile Task Management

A Kanban-style productivity engine for tracking deliverables.

- **Lifecycle Tracking**: Tasks flow through To Do, In Progress, Review, and Done.
- **Contextual Data**: Tasks support priorities (Low, Medium, High, Urgent), due dates, assignees, and rich markdown descriptions.
- **Real-Time Sync**: Task updates broadcast instantly to all workspace members via websockets, ensuring the board is never stale.

---

## 📝 Knowledge Base (Notes)

A collaborative documentation center.

- **Rich Text Editor**: Integrated WYSIWYG editor supporting deep Markdown formatting.
- **Organization**: Pin important notes, categorize with tags, and track authorship.
- **Security**: Aggressive XSS sanitization applied to all note content, strictly stripping malicious scripts or iframes.

---

## 🤖 AI Productivity Suite (Groq)

Generative AI integrated directly into the team workflow, powered by the blazing-fast Groq API (`llama-3.1-8b-instant`).

- **Smart Functions**:
  - Summarize long chat threads or complex notes.
  - Convert meeting notes directly into actionable tasks.
  - Sprint planning and priority suggestion algorithms.
  - Tone and writing improvement tools.
- **Resilient Engineering**: The AI service implements multi-key fallback rotation, strict 12-second timeouts, and daily usage limits tied to subscription tiers (Free = 10/day, Pro = 500/day).

---

## 🎥 Video Conferencing (Jitsi)

Zero-infrastructure video meetings integrated directly into the workspace.

- **Embedded Experience**: Full Jitsi Meet iframe integration (`meet.jit.si`) requiring no external desktop apps.
- **Room Lifecycle**: Track meetings via status (Upcoming, Live, Ended) and monitor active participants.
- **Rich Features**: HD Video/Audio, screen sharing, background blur, and in-call chat.

---

## 💳 Monetization & Billing

A production-ready SaaS billing pipeline powered by Razorpay.

- **Subscription Tiers**: Enforced boundaries for Free, Pro Monthly (Rs. 999), and Pro Yearly (Rs. 9,999) plans.
- **Secure Checkout**: Razorpay checkout modal with strict backend HMAC SHA-256 webhook signature verification.
- **Coupon Engine**: Direct Pro upgrade coupon codes bypassing Razorpay for promotional growth.
- **Usage Dashboards**: Real-time UI badges tracking member limits, AI calls, and storage quotas against plan limits.

---

## 📁 File Management & Media

Secure, scalable asset handling.

- **Hybrid Storage**: Uploads flow through `multer` memory storage (25MB limit) before syncing securely to **Cloudinary** (with a local fallback).
- **Validation**: Strict validation against 29 specific MIME types.
- **Profile Customization**: Users can upload and crop custom avatars.

---

## 🛡️ Administrative & Platform Features

Tools for scaling and auditing the ecosystem.

- **Global Search**: Workspace-scoped, debounced regex search across tasks, notes, messages, and files.
- **Central Notifications**: 100-item inbox for mentions, due dates, payments, and invites.
- **Activity Logging**: An immutable timeline tracking the last 150 workspace events (who changed what, and when).
- **Data Export**: GDPR-compliant, one-click ZIP download streaming all workspace JSON data.
- **Super Admin Panel**: A protected, global dashboard for monitoring total platform users, active subscriptions, and manually promoting/demoting users.

---

## Summary

DsSync Hub is substantially more than a standard portfolio project. It is a full-stack SaaS ecosystem demonstrating deep architectural thinking, real-world third-party integrations, and scalable product design.

---

<div align="center">
  <a href="../README.md">🏠 Home</a> | <a href="frontend.md">Next: Frontend Architecture →</a>
</div>
