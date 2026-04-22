# DsSync Hub - Database Documentation 🗄️

This document explains the MongoDB database structure used in DsSync Hub.

Database Engine:

* MongoDB Atlas / MongoDB Local

ODM:

* Mongoose

---

# 📌 Overview

DsSync Hub uses a document-based database model with modular collections for authentication, productivity, collaboration, and billing systems.

Main collections:

* users
  n- workspaces
* tasks
* notes
* messages
* subscriptions
* notifications (future ready)
* activities (future ready)

---

# 👤 users Collection

Stores account information.

## Fields

```json
{
  "_id": "ObjectId",
  "fullName": "Shivani Singh",
  "username": "shivani",
  "email": "shivani@gmail.com",
  "password": "hashed_password",
  "phone": "9876543210",
  "avatar": "image_url",
  "provider": "local | google",
  "role": "user",
  "isVerified": true,
  "resetPasswordToken": "hashed_token",
  "resetPasswordExpires": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Indexes

* email (unique)
* username (unique)
* phone (optional unique)

---

# 👥 workspaces Collection

Stores team / organization spaces.

## Fields

```json
{
  "_id": "ObjectId",
  "name": "DsSync Team",
  "slug": "dssync-team",
  "owner": "UserId",
  "members": ["UserId"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Relationships

* owner -> users
* members -> users[]

## Indexes

* slug (unique)

---

# ✅ tasks Collection

Stores productivity tasks.

## Fields

```json
{
  "_id": "ObjectId",
  "workspace": "WorkspaceId",
  "title": "Build billing page",
  "description": "Design and integrate checkout",
  "status": "todo",
  "priority": "high",
  "assignee": "UserId",
  "dueDate": "Date",
  "createdBy": "UserId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Status Values

* todo
* in_progress
* review
* done

## Priority Values

* low
* medium
* high
* critical

---

# 📝 notes Collection

Stores workspace notes.

## Fields

```json
{
  "_id": "ObjectId",
  "workspace": "WorkspaceId",
  "title": "Sprint Notes",
  "content": "Rich text or markdown",
  "owner": "UserId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 💬 messages Collection

Stores chat messages.

## Fields

```json
{
  "_id": "ObjectId",
  "workspace": "WorkspaceId",
  "sender": "UserId",
  "channel": "general",
  "message": "Hello team",
  "createdAt": "Date"
}
```

---

# 💳 subscriptions Collection

Stores plan and billing data.

## Fields

```json
{
  "_id": "ObjectId",
  "user": "UserId",
  "plan": "free | pro",
  "status": "active",
  "provider": "razorpay",
  "paymentId": "optional",
  "startDate": "Date",
  "endDate": "Date"
}
```

---

# 🔔 notifications Collection (Future Ready)

Stores alerts.

Examples:

* Task assigned
* Payment successful
* Invite received
* Mentioned in chat

---

# 📈 activities Collection (Future Ready)

Stores audit logs.

Examples:

* User logged in
* Task created
* Workspace renamed
* Subscription upgraded

---

# 🔗 Collection Relationships

```text
User
 ├── owns many Workspaces
 ├── creates many Tasks
 ├── writes many Notes
 ├── sends many Messages
 └── has one Subscription

Workspace
 ├── has many Members
 ├── has many Tasks
 ├── has many Notes
 └── has many Messages
```

---

# ⚡ Indexing Strategy

Used for faster queries:

* users.email
* users.username
* workspaces.slug
* tasks.workspace
* tasks.status
* notes.workspace
* subscriptions.user

---

# 🔐 Security Practices

* Passwords hashed before save
* Reset tokens hashed
* Sensitive data hidden in responses
* JWT used for access control
* No secrets stored in DB documents

---

# 🧪 Development Notes

Useful MongoDB commands:

```bash
npm run sync:indexes
```

Resyncs schema indexes.

---

# 🚀 Scaling Ideas

Future upgrades:

* Separate activity service
* Redis caching
* Full-text search indexes
* Message pagination indexes
* File metadata collection
* Analytics warehouse

---

# 📌 Summary

DsSync Hub uses a clean MongoDB structure with scalable collections supporting auth, productivity, billing, and collaboration features.
