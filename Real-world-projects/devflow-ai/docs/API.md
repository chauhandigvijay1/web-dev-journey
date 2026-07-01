# DevFlow AI — API Reference

Base URL: `https://devflow-api-ubnd.onrender.com/api` (production) or `http://localhost:5000/api` (development)

## Standard Response Envelope

All endpoints return JSON. The top-level shape is:

```json
{
  "success": true|false,
  "data": { ... },
  "message": "...",
  "stack": "..."   // only in non-production environments
}
```

Errors use HTTP status codes and the `success: false` envelope.

## Authentication

All protected endpoints require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is obtained from `POST /api/auth/login` or `POST /api/auth/signup` and expires in 7 days.

---

## Auth Endpoints (`/api/auth`)

---

### POST `/api/auth/register`

Create an account with just name, email, and password (no username).

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "MyStr0ngPass"
}
```

**Validation Rules:**
- `name`: required, min 2 characters
- `email`: required, valid email, disposable domains blocked (mailinator, 10minutemail, etc.)
- `password`: required, min 8 characters, must contain at least one uppercase letter, one lowercase letter, and one digit

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "name": "John Doe",
      "username": "",
      "email": "john@example.com",
      "role": "user",
      "subscription": { "plan": "free", "status": "inactive", "expiresAt": null },
      "usage": { "dailyCount": 0, "lastReset": "2025-01-01T00:00:00.000Z" },
      "phone": "",
      "profileImage": ""
    }
  }
}
```

**Error Responses:**
- `409` — Email already registered

---

### POST `/api/auth/signup`

Create an account with a custom username.

**Request Body:**

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "MyStr0ngPass"
}
```

**Validation Rules:**
- `name`: required, min 2 characters
- `username`: required, 3–40 characters, alphanumeric only (no spaces/special chars)
- `email`: required, valid email, disposable domains blocked
- `password`: required, same rules as register

**Success Response (201):**

```json
{
  "success": true,
  "token": "<JWT>",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "plan": "free",
    "status": "inactive",
    "settings": {},
    "avatar": null,
    "createdAt": "..."
  }
}
```

Note: Unlike the register endpoint, the signup response returns `token` and `user` **at the top level** (not wrapped in a `data` object). The `user.username` field will be populated.

**Error Responses:**
- `409` — Email already exists
- `409` — Username already taken

---

### POST `/api/auth/login`

Authenticate with email or username.

**Request Body:**

```json
{
  "identifier": "johndoe",
  "password": "MyStr0ngPass"
}
```

Alternatively, use the `email` field:

```json
{
  "email": "john@example.com",
  "password": "MyStr0ngPass"
}
```

**Validation Rules:**
- `identifier` or `email` — at least one is required
- `password` — required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

**Error Responses:**
- `401` — Invalid credentials

---

### GET `/api/auth/me`

Retrieve the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "subscription": { "plan": "free", "status": "inactive", "expiresAt": null },
    "usage": { "dailyCount": 0, "lastReset": "..." },
    "phone": "",
    "profileImage": ""
  }
}
```

---

### PUT `/api/auth/update`

Update the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body** (all fields optional):

```json
{
  "name": "John Updated",
  "username": "johnnew",
  "contact": "+1234567890",
  "phone": "+1234567890",
  "avatar": "https://res.cloudinary.com/...",
  "profileImage": "https://res.cloudinary.com/..."
}
```

**Notes:**
- `phone` maps to `contact` in the database
- `profileImage` maps to `avatar` in the database
- Changing `username` checks uniqueness across all users

**Success Response (200):**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error Responses:**
- `409` — Username already taken

---

### POST `/api/auth/forgot-password`

Generate a password reset token.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reset instructions generated.",
  "data": {
    "expiresInMinutes": 15
  }
}
```

**Note:** The reset token is sent via email using **Resend**. If `RESEND_API_KEY` is not configured, the token is logged to the server console. The API never returns the raw token in the response.

---

### POST `/api/auth/reset-password`

Reset the password using a valid reset token.

**Request Body:**

```json
{
  "token": "a1b2c3d4e5f6...",
  "password": "MyNewStr0ngPass1"
}
```

**Validation Rules:**
- `token`: required
- `password`: same strength rules as registration

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successful."
}
```

**Error Responses:**
- `400` — Reset token is invalid or expired

---

### DELETE `/api/auth/me`

Soft-delete the authenticated user's account.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Account deleted successfully."
}
```

**Notes:**
- The user's `isDeleted` flag is set to `true`
- Email and username are suffixed with `_deleted_{timestamp}` to free them for reuse
- The user is immediately unable to authenticate

---

### GET `/api/auth/settings`

Retrieve user preferences.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "nickname": "Johnny",
    "interests": "AI, React, Node.js",
    "region": "Asia",
    "language": "English",
    "country": "India",
    "timezone": "UTC+5:30",
    "startPage": "Dashboard",
    "emailUpdates": true,
    "compactMode": false
  }
}
```

If no settings have been saved, `data` will be an empty object `{}`.

---

### PUT `/api/auth/settings`

Update user preferences.

**Headers:** `Authorization: Bearer <token>`

**Request Body** (all fields optional):

```json
{
  "nickname": "Johnny",
  "interests": "AI, React, Node.js",
  "region": "Asia",
  "language": "English",
  "country": "India",
  "timezone": "UTC+5:30",
  "startPage": "Dashboard",
  "emailUpdates": true,
  "compactMode": false
}
```

**Allowed Fields:** `nickname`, `interests`, `region`, `language`, `country`, `timezone`, `startPage`, `emailUpdates`, `compactMode`

**Success Response (200):**

```json
{
  "success": true,
  "data": { ... }
}
```

---

## Chat Endpoints (`/api/chats`)

All chat endpoints require authentication.

---

### POST `/api/chats`

Create a new chat session.

**Request Body:**

```json
{
  "title": "My Chat Topic",
  "message": "Optional first message"
}
```

Both fields are optional. Default title is `"New Chat"`.

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "664f...",
    "userId": "664f...",
    "title": "My Chat Topic",
    "messages": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/api/chats`

List all chats for the authenticated user, sorted by most recent.

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "title": "Chat Title",
      "messages": [],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### GET `/api/chats/:id`

Retrieve a specific chat by its MongoDB ID.

**Validation:** `:id` must be a valid MongoDB ObjectId.

**Success Response (200):**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error Responses:**
- `404` — Chat not found

---

### DELETE `/api/chats/:id`

Delete a chat.

**Validation:** `:id` must be a valid MongoDB ObjectId.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

## AI Endpoints (`/api/ai`)

All AI endpoints require authentication.

---

### POST `/api/ai/prompt`

Send a prompt to the AI and receive a Server-Sent Events (SSE) stream of the response.

**Request Body:**

```json
{
  "chatId": "664f...",
  "prompt": "Explain closures in JavaScript"
}
```

**Validation Rules:**
- `chatId`: required, valid MongoDB ObjectId
- `prompt`: required, string, max 8000 characters

**Response Format (SSE):**

```
data: {"token":"Closures"}
data: {"token":" in"}
data: {"token":" JavaScript"}
data: {"token":" are..."}
data: [DONE]
```

**Headers:**
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

**Usage Limits:**
- Free tier: 20 prompts per day (UTC-based counter)
- Pro tier: unlimited (999 per day)

**Error Responses (pre-streaming):**
- `400` — Prompt required
- `404` — Chat not found
- `401` — User not found
- `429` — Daily limit reached. Upgrade to Pro.

**Streaming Errors:**
Errors during the stream are sent as SSE events with a token message, then terminated with `[DONE]`. The Express error handler is never invoked once streaming has started.

---

### POST `/api/ai/explain`

Get a single-turn code explanation (non-streaming).

**Request Body:**

```json
{
  "code": "const x = () => { return 42; }",
  "language": "javascript"
}
```

**Validation Rules:**
- `code`: required, max 50000 characters
- `language`: optional, max 50 characters

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "explanation": "This code defines an arrow function `x` that returns the number 42..."
  }
}
```

---

## Payment Endpoints (`/api/payments` or `/api/payment`)

All payment endpoints require authentication.

---

### POST `/api/payments/create-order`

Create a Razorpay order for Pro subscription checkout.

**Request Body (optional):**

```json
{
  "couponCode": "OFF50"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "orderId": "order_Ov1b2c3d4e5f6",
    "amount": 29900,
    "currency": "INR",
    "keyId": "rzp_test_..."
  }
}
```

**Free Checkout:**
If a coupon that reduces the amount to 0 is used (e.g., owner coupon), the response is:

```json
{
  "success": true,
  "data": {
    "orderId": "free_checkout",
    "amount": 0,
    "currency": "INR",
    "isFree": true
  }
}
```

**Error Responses:**
- `503` — Payment gateway is not configured

---

### POST `/api/payments/verify`

Verify a Razorpay payment and activate the Pro subscription.

**Request Body:**

```json
{
  "razorpay_order_id": "order_Ov1b2c3d4e5f6",
  "razorpay_payment_id": "pay_Ov1b2c3d4e5f6",
  "razorpay_signature": "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
  "couponCode": "OFF50"
}
```

**Signature Verification:**
The server computes `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)` and compares it to the provided `razorpay_signature`.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment successful"
}
```

**Error Responses:**
- `400` — Payment verification payload is incomplete
- `400` — Invalid signature
- `400` — Invalid or expired free checkout session
- `400` — This coupon has already been redeemed by this account

---

### POST `/api/payments/apply-coupon`

Validate a coupon code and return its details.

**Request Body:**

```json
{
  "couponCode": "OFF50"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "code": "OFF50",
    "amount": 14950,
    "durationDays": 30,
    "isSecret": false
  }
}
```

**Error Responses:**
- `400` — Invalid coupon code
- `400` — This coupon has already been redeemed by this account

---

### POST `/api/payments/cancel`

Cancel the active Pro subscription immediately. The user is reverted to free-tier limits.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully."
}
```

**Error Responses:**
- `400` — You do not have an active Pro subscription to cancel.

---

### GET `/api/payments/status`

Get the current billing status, usage, and subscription details. This endpoint also performs automatic maintenance (downgrades expired Pro subscriptions, resets daily counters on UTC date change).

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "plan": "free",
    "status": "inactive",
    "expiresAt": null,
    "usage": {
      "dailyCount": 5,
      "limit": 20,
      "remaining": 15,
      "lastReset": "2025-01-01T00:00:00.000Z"
    },
    "pricing": {
      "regularMonthly": 29900,
      "currency": "INR"
    },
    "expiredOfferPrompt": {
      "show": false,
      "message": "Your Pro access has expired. Upgrade to continue."
    }
  }
}
```

---

## Upload Endpoints (`/api/uploads` or `/api/upload`)

All upload endpoints require authentication. Files are uploaded to Cloudinary.

---

### POST `/api/uploads`

Upload any file type (up to 5 MB).

**Request:** `multipart/form-data` with field name `file`.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "devflow-ai/abc123"
  }
}
```

---

### POST `/api/uploads/profile`

Upload a profile image. Only image MIME types are accepted. Images are automatically resized to 512×512 with auto quality and format optimization.

**Request:** `multipart/form-data` with field name `file`.

**Success Response (200):**

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/..."
}
```

**Error Responses:**
- `400` — Only image files are allowed
- `400` — Image file is required

---

## Health Check

### GET `/api/health`

**Response (200):**

```json
{
  "success": true,
  "message": "DevFlow AI API running"
}
```

---

## Error Codes Summary

| Status Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation or business logic) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email/username) |
| 422 | Validation Error (express-validator) |
| 429 | Rate limit or daily usage limit exceeded |
| 500 | Internal Server Error |
| 503 | Service unavailable (infra dependency down) |

## Rate Limiting

The entire API is rate-limited to 300 requests per 15-minute window per IP.
