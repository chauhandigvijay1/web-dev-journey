# DevFlow AI — Database Schema

**Database:** MongoDB Atlas (MongoDB 7.x+)  
**ODM:** Mongoose 8.x  
**Connection:** Single connection via `mongoose.connect()` with `strictQuery: true`

## Collections

### 1. `users` — Core user accounts

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `name` | String | required, 2–60 chars | Display name |
| `username` | String | unique (sparse), lowercase, 3–40 chars, alphanumeric | Unique handle |
| `email` | String | required, unique, lowercase, trimmed | Login identifier |
| `contact` | String | max 25 chars, default `""` | Phone number |
| `avatar` | String | default `""` | Profile image URL |
| `password` | String | required, min 8, `select: false` | bcrypt hash (12 rounds) |
| `resetPasswordToken` | String | `select: false` | SHA-256 hash of reset token |
| `resetPasswordExpires` | Date | `select: false` | Expiry for reset token |
| `role` | String | enum: `user`, `admin` | Authorization level |
| `subscription` | Object (embedded) | — | See sub-schema below |
| `usage` | Object (embedded) | — | See sub-schema below |
| `settings` | Object (Maps) | default `{}` | User preferences (nickname, region, language, etc.) |
| `usedCoupons` | [String] | — | Array of redeemed coupon codes |
| `isDeleted` | Boolean | default `false` | Soft delete flag |
| `deletedAt` | Date | — | When account was soft-deleted |
| `createdAt` | Date | auto (timestamps) | — |
| `updatedAt` | Date | auto (timestamps) | — |

**Embedded: `subscription`**

| Field | Type | Default | Description |
|---|---|---|---|
| `plan` | String | `"free"` | enum: `free`, `pro` |
| `status` | String | `"inactive"` | enum: `inactive`, `active`, `past_due`, `canceled`, `trialing` |
| `expiresAt` | Date | — | When Pro access expires |
| `offerCode` | String | `""` | Coupon code used for this subscription |

**Embedded: `usage`**

| Field | Type | Default | Description |
|---|---|---|---|
| `dailyCount` | Number | 0 | Number of AI prompts used today |
| `lastReset` | Date | `Date.now` | Last UTC date when counter was reset |

**Indexes:**
- `{ email: 1 }` — unique (default Mongoose index)
- `{ username: 1 }` — unique, sparse (default Mongoose index)
- `{ isDeleted: 1 }` — for filtering active accounts

**Password Hooks:**
- Pre-save hook: hashes password with bcrypt (12 salt rounds) only when `password` field is modified
- Instance method `comparePassword(candidate)`: compares plaintext against stored hash

**Soft Delete Behavior:**
When an account is deleted:
- `isDeleted` is set to `true`
- `deletedAt` is set to the current timestamp
- `email` is suffixed with `_deleted_{timestamp}` to free the original email
- `username` is similarly suffixed if present
- The user is rejected by `authMiddleware` on subsequent requests

---

### 2. `chats` — AI conversation sessions

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | required, ref `User`, indexed | Owner of the chat |
| `title` | String | default `"New Chat"` | Auto-generated from first prompt |
| `messages` | [Message] | default `[]` | Array of embedded message subdocuments |
| `createdAt` | Date | auto (timestamps) | — |
| `updatedAt` | Date | auto (timestamps) | — |

**Embedded: `messages[]`** (no `_id`)

| Field | Type | Constraints | Description |
|---|---|---|---|
| `role` | String | required, enum: `user`, `assistant`, `system` | Message origin |
| `content` | String | required | Message body |
| `createdAt` | Date | auto (timestamps) | — |
| `updatedAt` | Date | auto (timestamps) | — |

**Indexes:**
- `{ userId: 1 }` — for listing user's chats
- `{ userId: 1, _id: 1 }` — compound for ownership-verified lookups

**Title Auto-Generation:**
When the first user message is sent, if the title is still the default `"New Chat"`, it is replaced with the first 60 characters of the prompt.

**Document Size Consideration:**
Messages are embedded within the chat document. MongoDB's 16 MB document size limit is the practical constraint. Each message averages ~500 bytes, allowing approximately 30,000+ messages per chat before hitting limits.

---

### 3. `subscriptions` — Legacy subscription records

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | required, ref `User`, **unique** | One subscription record per user |
| `plan` | String | enum: `free`, `pro` | Current plan |
| `status` | String | enum: `inactive`, `active`, `past_due`, `canceled`, `trialing` | Subscription state |
| `createdAt` | Date | auto (timestamps) | — |
| `updatedAt` | Date | auto (timestamps) | — |

**Status:** This collection is **legacy**. The primary subscription state is now embedded in the `users` document. This collection is still created during signup but is not referenced by business logic. The embedded `user.subscription` object is the source of truth. Stripe-related fields have been removed as the app uses Razorpay exclusively.

---

## Relationships (Logical)

```
User (1) ────── has many ────── Chat (many)
  │                                  │
  │                                  └── messages[] (embedded)
  │
  └── subscription (embedded)
  └── usage (embedded)
  └── usedCoupons[]
  └── Subscription (1) ─── legacy reference
```

---

## Design Rationale

### Why embed messages in the Chat document?
- The primary access pattern is "load all messages for a single chat"
- Avoids a separate `JOIN`-like lookup (which MongoDB doesn't support natively)
- Simplifies pagination within a single document query
- 16 MB limit is acceptable for text-based chat histories

### Why embed subscription in the User document?
- Every authenticated request checks the user's plan
- Eliminates a separate query to the subscriptions collection
- Simplifies atomic updates (e.g., upgrading plan within a single document write)

### Why keep the separate Subscription collection?
- Legacy migration path — created by the original schema
- Could be used in the future for analytics, invoicing, or Stripe integration
- No active business logic depends on it

### Why soft delete instead of hard delete?
- Preserves referential integrity for chat histories (even if inaccessible)
- Allows account recovery within a grace period
- Frees up the email/username immediately for re-registration

## Mongoose Configuration

```javascript
mongoose.set("strictQuery", true);
autoIndex: env.nodeEnv !== "production"  // auto-index only in dev
```

In production, indexes should be created via MongoDB Atlas management tools.
