# Database Documentation

## Overview

JobPilot uses **MongoDB Atlas** as its primary data store, accessed through the **Mongoose 8** ODM (Object Document Mapper). The application connects to a configurable `MONGO_URI` environment variable with a 10-second server selection and connection timeout.

MongoDB was chosen for its flexible document model, which naturally maps to the polymorphic job application data that varies across job boards and user workflows.

## Schema Design Philosophy

### Embedded Contacts (Denormalized)

Job contacts are **embedded** as a sub-document array within each job document rather than stored in a separate `contacts` collection. This decision was made because:

- Contacts have a strong **ownership relationship** to a single job (no sharing across jobs)
- Contacts are always queried alongside the parent job (no standalone contact views)
- The average contact count per job is low (1–5), avoiding unbounded array growth
- Eliminates expensive `$lookup` joins for the most common read patterns

### User Settings (Embedded)

User preferences, productivity configuration, and notification settings are embedded as a nested sub-document under `settings`. Settings are always loaded with the user and modified atomically, making a separate collection unnecessary.

### Reminder Queue (Separate Collection)

Reminders use a dedicated `ReminderQueue` collection to enable efficient sweep-based processing with atomic `findOneAndUpdate` claims, status tracking, and retry logic independent of the Job and User collections.

---

## User Schema

**Collection:** `users`  
**File:** `backend/src/models/User.js`

| Field | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `name` | `String` | Yes | — | `trim: true` |
| `username` | `String` | No | — | `unique: true`, `sparse: true`, `lowercase: true`, `trim: true` |
| `email` | `String` | Yes | — | `unique: true`, `lowercase: true`, `trim: true` |
| `password` | `String` | No | `undefined` | `select: false`, hashed via `bcrypt` pre-save hook |
| `googleId` | `String` | No | `undefined` | `unique: true`, `sparse: true`, `trim: true` |
| `hasPassword` | `Boolean` | No | `true` | Tracks whether password authentication is enabled |
| `profilePic` | `String` | No | `""` | `trim: true` |
| `phone` | `String` | No | `""` | `trim: true` |
| `bio` | `String` | No | `""` | `trim: true` |
| `emailNotifications` | `Boolean` | No | `true` | — |
| `tokenVersion` | `Number` | No | `0` | Incremented on password change to invalidate sessions |
| `refreshTokenHash` | `String` | No | `""` | `select: false` — SHA-256 hash of current refresh token |
| `refreshSessionId` | `String` | No | `""` | `select: false` — UUID for session binding |
| `refreshTokenExpiresAt` | `Date` | No | `null` | `select: false` — Expiration timestamp |
| `settings.jobPreferences.preferredJobType` | `String` | No | `""` | `trim: true` |
| `settings.jobPreferences.preferredLocation` | `String` | No | `""` | `trim: true` |
| `settings.jobPreferences.expectedSalaryRange` | `String` | No | `""` | `trim: true` |
| `settings.productivity.defaultFollowUpDays` | `Number` | No | `5` | `min: 0, max: 30` |
| `settings.productivity.autoMarkGhostedDays` | `Number` | No | `21` | `min: 0, max: 365` |
| `settings.notifications.timezone` | `String` | No | `"UTC"` | `trim: true`, validated against IANA timezone DB |
| `settings.notifications.reminderHour` | `Number` | No | `9` | `min: 0, max: 23` |
| `settings.notifications.weeklySummaryEnabled` | `Boolean` | No | `false` | — |
| `createdAt` | `Date` | Auto | — | `timestamps: { createdAt: true, updatedAt: false }` |

### Computed Fields (not persisted)

The `authProviders` field is computed dynamically in `auth.service.js`:

```javascript
authProviders: {
  password: user.hasPassword !== false,
  google: Boolean(user.googleId),
}
```

---

## Job Schema

**Collection:** `jobs`  
**File:** `backend/src/models/Job.js`

| Field | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `user` | `ObjectId` (ref User) | Yes | — | `index: true` |
| `title` | `String` | Yes | — | `trim: true` |
| `company` | `String` | No | `""` | `trim: true` |
| `location` | `String` | No | `""` | `trim: true` |
| `locations` | `[String]` | No | `[]` | Each element: `trim: true` |
| `jobType` | `String` | No | `""` | `trim: true` |
| `salary` | `String` | No | `""` | `trim: true` |
| `experience` | `String` | No | `""` | `trim: true` |
| `joiningType` | `String` | No | `""` | `trim: true` |
| `source` | `String` | No | `""` | `trim: true` |
| `expectedSalary` | `String` | No | `""` | `trim: true` |
| `offeredSalary` | `String` | No | `""` | `trim: true` |
| `companyType` | `String` | No | `""` | `trim: true` |
| `confidenceScore` | `Number` | No | `0` | — |
| `notes` | `String` | No | `""` | `trim: true` |
| `skills` | `[String]` | No | `[]` | Each element: `trim: true` |
| `qualification` | `String` | No | `""` | `trim: true` |
| `applyDeadline` | `Date` | No | `null` | — |
| `workMode` | `String` | No | `""` | `trim: true` |
| `descriptionSummary` | `String` | No | `""` | `trim: true` |
| `originalApplyLink` | `String` | No | `""` | `trim: true` |
| `status` | `String` (enum) | No | `"saved"` | `enum: ["saved", "applied", "oa", "interview", "offer", "rejected"]` |
| `isPinned` | `Boolean` | No | `false` | — |
| `isImportant` | `Boolean` | No | `false` | — |
| `isGhosted` | `Boolean` | No | `false` | — |
| `resumeUrl` | `String` | No | `""` | `trim: true` |
| `followUpDate` | `Date` | No | `null` | — |
| `reminderLastSentAt` | `Date` | No | `null` | — |
| `reminderLastSentForDate` | `String` | No | `""` | `trim: true` |
| `priorityScore` | `Number` | No | `50` | 0–100 score for Opportunity Prioritization Engine |
| `contacts` | `[Contact]` | No | `[]` | Embedded sub-documents (see below) |
| `createdAt` | `Date` | Auto | — | `timestamps: true` |
| `updatedAt` | `Date` | Auto | — | `timestamps: true` |

### Contact Sub-document

| Field | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `name` | `String` | Yes | — | `trim: true` |
| `role` | `String` | No | `"Recruiter"` | `trim: true` |
| `email` | `String` | No | `""` | `trim: true` |
| `linkedin` | `String` | No | `""` | `trim: true` |
| `status` | `String` (enum) | No | `"Contacted"` | `enum: ["Contacted", "Replied", "Follow Up", "Interview Scheduled", "Closed"]` |
| `lastContactDate` | `Date` | No | `Date.now()` | Default set via function `() => Date.now()` |

---

## Indexes

### `jobs` Collection

| Index | Fields | Purpose |
|---|---|---|
| Index 1 | `{ user: 1, status: 1, updatedAt: -1 }` | Powers the Kanban dashboard — fetches all jobs for a user, filtered by status column, ordered by most recently updated |
| Index 2 | `{ user: 1, followUpDate: 1 }` | Powers the reminder scheduler — finds jobs with upcoming or overdue follow-up dates for a specific user |
| Index 3 | `{ user: 1, applyDeadline: 1 }` | Powers deadline reminders — finds jobs approaching their application deadline |

### `users` Collection

MongoDB automatically creates unique indexes for fields with `unique: true` — specifically `email`, `username` (sparse), and `googleId` (sparse).

### `reminderqueues` Collection

| Index | Fields | Purpose |
|---|---|---|
| Index 1 | `{ status: 1, nextAttemptAt: 1 }` | Powers the sweep-based reminder processor — efficiently claims the next pending/retry reminder that is due |
| Index 2 | `{ dedupeKey: 1 }` | Unique index (from `unique: true`) — prevents duplicate reminders for the same job/type/date combination |
| Index 3 | `{ user: 1 }` | Supports cancellations and queries by user |
| Index 4 | `{ job: 1 }` | Supports job-level reminder management |

---

## Query Patterns

### Primary Reads

```javascript
// Kanban board — all jobs for a user grouped by status
Job.find({ user: userId }).sort({ updatedAt: -1 }).lean()

// Single status column
Job.find({ user: userId, status: "interview" }).sort({ updatedAt: -1 }).lean()

// Follow-up reminders (sweep)
Job.find({ user: userId, followUpDate: { $lte: now } }).sort({ followUpDate: 1 })

// Deadline reminders
Job.find({ user: userId, applyDeadline: { $lte: deadline } })

// Job detail
Job.findOne({ _id: jobId, user: userId })

// Priority-ordered view
Job.find({ user: userId }).sort({ priorityScore: -1, updatedAt: -1 })
```

### Writes

```javascript
// Create job
Job.create({ user: userId, title, company, ... })

// Update status (Kanban drag-and-drop)
Job.findOneAndUpdate({ _id: jobId, user: userId }, { status: newStatus })

// Bulk status updates
Job.updateMany({ user: userId, status: "saved" }, { isGhosted: true })

// Pin/unpin
Job.findOneAndUpdate({ _id: jobId, user: userId }, { isPinned: true })
```

---

## Data Relationships

```
User (1) ────< (N) Job
User (1) ────< (N) ReminderQueue
Job  (1) ────< (N) ReminderQueue
```

- A **User** has many **Jobs** (foreign key: `job.user` → `user._id`)
- A **User** has many **ReminderQueue** entries (foreign key: `reminder.user` → `user._id`)
- A **Job** has many **ReminderQueue** entries (foreign key: `reminder.job` → `job._id`)
- A **Job** has many embedded **Contacts** (denormalized array)
- A **User** has embedded **Settings** (denormalized sub-document)

Relationships are enforced application-side through Mongoose `ref` and validated in route handlers — there are no database-level foreign key constraints (consistent with MongoDB design patterns).

---

## Migration Strategy

JobPilot follows a **no-formal-migration-tool** approach, which is idiomatic for Mongoose applications:

1. **Schema changes are made directly** in the Mongoose schema definition file
2. **Code handles both old and new shapes** during the transition period (backward-compatible reads)
3. **Optional backfill scripts** can be run at startup (e.g., `backfillMissingUsernames` in `server.js`)

### Common Migration Patterns

| Scenario | Approach |
|---|---|
| Adding a new optional field | Add to schema with `default`. Old documents get the default on read. |
| Adding a required field | Add as optional first, backfill data, then make required. |
| Renaming a field | Keep both fields during transition; write-once migration script. |
| Removing a field | Remove from schema; old data remains in MongoDB but is not projected. |
| New collection | Define new model; seed at startup if needed. |
| Index changes | Add/remove `schema.index()` calls; Mongoose ensures indexes on `Model.init()`. |

### Data Integrity

- Mongoose `unique` indexes are enforced by MongoDB. Handle `E11000` duplicate key errors gracefully (see `duplicateFieldMessage` in `auth.controller.js`).
- Embedded document defaults are handled by Mongoose on document creation.
- The `ReminderQueue` schema uses `dedupeKey` (unique) to prevent duplicate reminder creation for the same job/type/date combination.

---

## Backup Recommendations

### MongoDB Atlas (Recommended)

1. **Enable Atlas Automated Backups**
   - Atlas provides continuous backups with point-in-time recovery (PITR) for M10+ clusters
   - Backup frequency: every 6–12 hours with 1–7 day retention depending on cluster tier

2. **Export Before Schema Migrations**
   ```bash
   mongodump --uri="<MONGO_URI>" --out=./backups/$(date +%Y-%m-%d)
   ```

3. **Export Reminder Queue Separately**
   The `reminderqueues` collection is transient — reminders are re-generated on job save. It can be excluded from production backups to save space.

4. **Validate Backups**
   ```bash
   mongorestore --dry-run --uri="<MONGO_URI>" ./backups/2026-07-01
   ```

### Manual Backup Commands

```bash
# Full database dump
mongodump --uri="<MONGO_URI>" --gzip --archive=jobpilot-$(date +%Y-%m-%d).gz

# Single collection restore
mongorestore --uri="<MONGO_URI>" --nsInclude="jobpilot.jobs" --gzip --archive=jobpilot-2026-07-01.gz

# Export users (excluding password fields)
mongoexport --uri="<MONGO_URI>" --collection=users --fields=name,username,email,createdAt --out=users.json
```
