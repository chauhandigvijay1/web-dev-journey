# DsSync Hub - API Reference 📡

This document lists the main backend API endpoints used in DsSync Hub.

Base URL (Local Development):

```text
http://localhost:5000/api
```

---

# 📌 Response Format

## Success Example

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

## Error Example

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

# 🔐 Authentication APIs

## Register User

```http
POST /auth/register
```

### Body

```json
{
  "fullName": "Shivani Singh",
  "username": "shivani",
  "email": "shivani@gmail.com",
  "password": "StrongPass123"
}
```

---

## Login User

```http
POST /auth/login
```

### Body

```json
{
  "identifier": "shivani@gmail.com",
  "password": "StrongPass123"
}
```

`identifier` may be email / username / phone.

---

## Google Login

```http
POST /auth/google
```

### Body

```json
{
  "credential": "google_id_token"
}
```

---

## Get Current User

```http
GET /auth/me
```

Requires auth token.

---

## Logout

```http
POST /auth/logout
```

---

## Forgot Password

```http
POST /auth/forgot-password
```

### Body

```json
{
  "email": "shivani@gmail.com"
}
```

---

## Reset Password

```http
POST /auth/reset-password
```

### Body

```json
{
  "token": "reset_token",
  "password": "NewStrongPass123"
}
```

---

# 👤 User APIs

## Update Profile

```http
PUT /users/profile
```

## Change Password

```http
PUT /users/change-password
```

## Upload Avatar

```http
POST /users/avatar
```

---

# 👥 Workspace APIs

## Get Workspaces

```http
GET /workspaces
```

## Create Workspace

```http
POST /workspaces
```

### Body

```json
{
  "name": "My Startup Team"
}
```

## Rename Workspace

```http
PUT /workspaces/:id
```

## Delete Workspace

```http
DELETE /workspaces/:id
```

## Invite Member

```http
POST /workspaces/:id/invite
```

---

# ✅ Task APIs

## Get Tasks

```http
GET /tasks
```

## Create Task

```http
POST /tasks
```

### Body

```json
{
  "title": "Build Landing Page",
  "priority": "high",
  "status": "todo"
}
```

## Update Task

```http
PUT /tasks/:id
```

## Delete Task

```http
DELETE /tasks/:id
```

## Move Task Status

```http
PATCH /tasks/:id/status
```

---

# 📝 Notes APIs

## Get Notes

```http
GET /notes
```

## Create Note

```http
POST /notes
```

## Update Note

```http
PUT /notes/:id
```

## Delete Note

```http
DELETE /notes/:id
```

---

# 💬 Chat APIs

## Get Conversations

```http
GET /chat
```

## Send Message

```http
POST /chat/message
```

## Get Channels

```http
GET /chat/channels
```

---

# 💳 Billing APIs

## Get Plans

```http
GET /billing/plans
```

## Create Razorpay Order

```http
POST /billing/create-order
```

## Verify Payment

```http
POST /billing/verify
```

## Subscription Status

```http
GET /billing/status
```

---

# 🤖 AI APIs

## Summarize Text

```http
POST /ai/summarize
```

## Rewrite Text

```http
POST /ai/rewrite
```

## Generate Tasks

```http
POST /ai/tasks
```

---

# 🔎 Search APIs

## Global Search

```http
GET /search?q=keyword
```

Searches tasks, notes, users, and workspace data.

---

# 🔐 Protected Route Rules

Most private routes require:

```http
Authorization: Bearer <token>
```

---

# 📌 Status Codes

* `200` Success
* `201` Created
* `400` Validation Error
* `401` Unauthorized
* `403` Forbidden
* `404` Not Found
* `500` Server Error

---

# 🧪 Testing Tips

Use:

* Postman
* Thunder Client
* Frontend UI flows
* Automated integration tests

---

# 🔮 Future API Expansion

* Notifications API
* Calendar API
* File upload API
* Admin API
* Analytics API
* Webhooks

---

# 📌 Summary

DsSync Hub backend is structured with modular REST APIs covering authentication, collaboration, productivity, billing, and future-ready integrations.
