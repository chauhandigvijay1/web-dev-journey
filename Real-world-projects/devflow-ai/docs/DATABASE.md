<div align="left">
  <img src="./assets/logo.svg" alt="DevFlow AI Logo" width="80" height="80" />
</div>

# Database Schema

DevFlow AI leverages a high-performance MongoDB Atlas 7+ document store combined with the Mongoose 8 Object Data Modeling (ODM) library. The schema is purposefully designed with embedded subdocuments to optimize access patterns and minimize latency during high-frequency AI interactions.

---

## Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Collections](#collections)
  - [Users (Core Accounts)](#users--core-accounts)
  - [Chats (AI Sessions)](#chats--ai-sessions)
  - [Subscriptions (Legacy)](#subscriptions--legacy)
- [Design Rationale](#design-rationale)
- [Configuration & Deployment](#configuration--deployment)
- [Best Practices](#best-practices)
- [Related Documents](#related-documents)
- [Next Reading](#next-reading)

---

## Overview

DevFlow AI uses MongoDB as its primary data store. By favoring a denormalized schema where related data is embedded directly within documents, the system entirely bypasses expensive `JOIN`-like lookups (i.e., `$lookup`). The database is structured around three primary collections: `users`, `chats`, and a legacy `subscriptions` collection.

> [!NOTE]  
> All primary business logic evaluates user permissions and usage limits using embedded subdocuments on the `user` record to guarantee atomic updates and instantaneous reads.

---

## Entity Relationship Diagram

The following diagram illustrates the overarching entity relationships, detailing fields, types, and primary/foreign keys across the platform.

```mermaid
erDiagram
    User ||--o{ Chat : "has many"
    User ||--o| Subscription : "has one (legacy)"
    
    User {
        ObjectId _id PK
        string name
        string username UK
        string email UK
        string contact
        string avatar
        string password_hash
        string role
        object subscription
        object usage
        map settings
        array usedCoupons
        array usedPaymentIds
        string checkoutNonce
        date checkoutNonceExpires
        boolean isDeleted
        date deletedAt
    }
    
    Chat {
        ObjectId _id PK
        ObjectId userId FK
        string title
        array messages
        date createdAt
        date updatedAt
    }
    
    Subscription {
        ObjectId _id PK
        ObjectId userId FK UK
        string plan
        string status
        date createdAt
        date updatedAt
    }
```

---

## Collections

### Users — Core Accounts

The `users` collection is the backbone of the application. It manages authentication, authorization, personalization, and plan state via embedded subdocuments.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Primary key. |
| `name` | String | Required, 2–60 chars | User's display name. |
| `username` | String | Unique (sparse), 3–40 chars, alphanumeric, lowercase | Unique user handle. |
| `email` | String | Required, unique, lowercase, trimmed | Login identifier. |
| `contact` | String | Max 25 chars, default `""` | User's phone number. |
| `avatar` | String | Default `""` | Profile image URL (hosted on Cloudinary). |
| `password` | String | Required, min 8, `select: false` | bcrypt hash (12 rounds). |
| `resetPasswordToken` | String | `select: false` | SHA-256 hash of the password reset token. |
| `resetPasswordExpires` | Date | `select: false` | Expiry time for the reset token. |
| `role` | String | Enum: `user`, `admin` | Application authorization level. |
| `subscription` | Object | Embedded | Current plan, status, expiry, and offer code. |
| `usage` | Object | Embedded | Token/prompt usage tracking (`dailyCount`, `lastReset`). |
| `settings` | Maps | Default `{}` | Flexible preferences (nickname, region, language, etc.). |
| `usedCoupons` | [String] | — | Array of redeemed promotional codes. |
| `usedPaymentIds` | [String] | — | Tracked Razorpay payment IDs to prevent double processing. |
| `checkoutNonce` | String | — | One-time nonce for processing free checkouts. |
| `checkoutNonceExpires` | Date | — | Expiry timestamp for the checkout nonce. |
| `isDeleted` | Boolean | Default `false` | Soft delete flag indicating if the account was removed. |
| `deletedAt` | Date | — | Timestamp recording when the account was soft deleted. |

#### Embedded `subscription` Subdocument

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `plan` | String | `"free"` | Enum: `free`, `pro`. |
| `status` | String | `"inactive"` | Enum: `inactive`, `active`, `past_due`, `canceled`, `trialing`. |
| `expiresAt` | Date | — | Expiry timestamp for Pro access. |
| `offerCode` | String | `""` | Coupon or promotional code used to activate this subscription. |

#### Embedded `usage` Subdocument

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `dailyCount` | Number | `0` | Counter for AI prompts executed today. |
| `lastReset` | Date | `Date.now` | Last UTC timestamp of the daily counter reset. |

#### Security & Lifecycle Features

> [!IMPORTANT]  
> The system ensures safe credential management and implements a strict soft delete pattern to preserve conversational context while complying with user data removal requests.

*   **Indexes:** 
    *   `{ email: 1 }` (Unique, Default)
    *   `{ username: 1 }` (Unique, Sparse, Default)
    *   `{ isDeleted: 1 }` (Optimized for filtering out inactive accounts in admin views)
*   **Password Hooks:** 
    *   A pre-save Mongoose hook hashes the password with **bcrypt (12 rounds)**, triggering only when the `password` field is modified.
    *   An instance method `comparePassword(candidate)` executes timing-safe comparison against the stored hash.
*   **Soft Delete Mechanism:** 
    *   When an account is deleted, `isDeleted` is flipped to `true`, and `deletedAt` records the timestamp.
    *   The user's `email` and `username` fields are suffixed with `_deleted_{timestamp}` to immediately free them up for reuse.
    *   The `protect` authentication middleware aggressively intercepts and rejects requests originating from soft-deleted users.

---

### Chats — AI Sessions

The `chats` collection stores user interactions with the AI.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Primary key. |
| `userId` | ObjectId | Required, ref `User`, indexed | Identifier of the user who owns this chat. |
| `title` | String | Default `"New Chat"` | The chat title, auto-generated from the initial prompt. |
| `messages` | [Message] | Default `[]` | Embedded subdocuments representing the conversation thread. |
| `createdAt` | Date | Auto (timestamps) | Document creation time. |
| `updatedAt` | Date | Auto (timestamps) | Document last modification time. |

#### Embedded `messages[]` Subdocument

Messages are embedded tightly into the parent document without explicit `_id` mappings to keep payload sizes small.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `role` | String | Required, enum: `user`, `assistant`, `system` | Specifies the originator of the message. |
| `content` | String | Required | The raw markdown or text content of the message. |
| `createdAt` | Date | Auto | Message creation timestamp. |
| `updatedAt` | Date | Auto | Message last modification timestamp. |

#### Key Behaviors

*   **Indexes:** 
    *   `{ userId: 1 }` (Speeds up listing a user's recent chat history)
    *   `{ userId: 1, _id: 1 }` (Compound index optimizing exact chat lookups scoped by ownership)
*   **Title Auto-Generation:** When the first `user` message hits a chat where the title is still `"New Chat"`, the system seamlessly updates the title to the first 60 characters of that prompt.
*   **Document Size Ceiling:** Because messages are embedded, space utilization is a consideration. Averaging ~500 bytes per message, MongoDB's hard 16 MB document limit comfortably supports robust conversation threads of **30,000+ messages** before rolling over.

---

### Subscriptions — Legacy

This collection was foundational in early platform iterations but is no longer structurally active in primary business workflows.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Primary key. |
| `userId` | ObjectId | Required, ref `User`, **unique** | Enforces a single legacy record per user. |
| `plan` | String | Enum: `free`, `pro` | The user's legacy plan status. |
| `status` | String | Enum: `inactive`, `active`, `past_due`, `canceled`, `trialing` | Legacy billing state. |
| `createdAt` | Date | Auto | — |
| `updatedAt` | Date | Auto | — |

> [!WARNING]  
> This is a legacy collection. While a document is created here during user signup, it is strictly not referenced by API logic. The embedded `user.subscription` object remains the **single source of truth**.

---

## Design Rationale

DevFlow AI's schema departs from rigid SQL normalization in favor of access-optimized document patterns. 

| Decision | Rationale |
| :--- | :--- |
| **Embed messages in `Chat`** | The overwhelming primary access pattern is *"Load all messages for this chat on mount"*. Embedding removes lookup overhead, yielding faster initial loads. The 16 MB threshold is well beyond the bounds of standard AI session durations. |
| **Embed subscription in `User`** | Nearly every authenticated endpoint evaluates user plan validity and rate limits. Keeping this data native to the `User` object eliminates external queries and guarantees atomic, transactional integrity during plan upgrades. |
| **Soft Delete over Hard Delete** | Ensures referential integrity so that chat histories remain intact, permits straightforward account recovery workflows, and avoids complex cascading delete operations across large datasets. |
| **Preserve legacy `Subscription`** | Kept strictly for potential historical auditing or future migrations to external billing providers (e.g., Stripe, Paddle), minimizing breakage risk to older platform integrations. |

---

## Configuration & Deployment

Mongoose maintains a single, resilient connection pool managed globally.

```javascript
import mongoose from 'mongoose';

// Ensure Mongoose strictly filters out schema-undefined fields in query filters
mongoose.set("strictQuery", true);

// Suppress index auto-creation in production to prevent unexpected performance hits
const autoIndex = process.env.NODE_ENV !== "production";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { autoIndex });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Connection error:", error);
    process.exit(1);
  }
};
```

> [!TIP]  
> **Production Indexing:** In production, rely exclusively on MongoDB Atlas's UI or external CI/CD index deployment scripts instead of Mongoose's `autoIndex` to prevent database locking during high traffic.

---

## Best Practices

*   **Projection Optimization:** When querying `User` objects across non-administrative routes, strongly define your Mongoose projections (e.g., `.select("-usedCoupons -usedPaymentIds")`) to minimize network transit size.
*   **Index Strategy:** Monitor the performance of the compound index `{ userId: 1, _id: 1 }` via Atlas Query Profiler as your `Chat` collection scales, ensuring lookups remain under the 100ms threshold.
*   **Soft-Delete Cleanup:** Consider setting up a chron job (e.g., node-cron) to permanently purge soft-deleted user records and their associated chats after a generous grace period (e.g., 90 days) to keep cluster storage costs minimal.

---

## Related Documents

- [Architecture Overview](./architecture.md)
- [Backend Architecture](./backend.md)
- [API Reference](./api.md)

---

## Next Reading

> **Next:** [API Reference](./api.md) — Explore the complete REST API documentation, including robust request/response schemas for all 24 core platform endpoints.

---

<br />
<div align="center">
  <p>
    <sub>© 2026 DevFlow AI. Built with Next.js, Express, MongoDB, and Groq AI.</sub>
  </p>
</div>
