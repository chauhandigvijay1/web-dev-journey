# DevFlow AI — System Architecture

## Overview

DevFlow AI is a decoupled, full-stack SaaS application that provides an AI-powered chat interface for developers. The architecture follows a standard client-server model with a RESTful API gateway, a MongoDB document store, and integrations with four external services: Groq (AI inference), Razorpay (payments), Resend (email), and Cloudinary (media storage).

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js 16)                     │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  Login   │  │Dashboard │  │  Chat    │  │   Settings    │   │
│  │  Signup  │  │          │  │  Window  │  │   Billing     │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
│         │              │            │               │           │
│         └──────────────┴────────────┴───────────────┘           │
│                            │                                     │
│                    ┌───────┴────────┐                            │
│                    │  Redux Store   │                            │
│                    │  (auth + chat) │                            │
│                    └───────┬────────┘                            │
│                            │                                     │
│                    ┌───────┴────────┐                            │
│                    │  Axios Client  │                            │
│                    │  (api.js)     │                            │
│                    └───────┬────────┘                            │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS / REST + SSE
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Express 5)                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  CORS/Helmet │  │  Rate Limiter    │  │  Morgan Logger   │   │
│  └──────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Routes                               │   │
│  │  /api/auth  │  /api/chats  │  /api/ai  │  /api/payments  │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │              │            │               │           │
│  ┌──────┴──────┐ ┌─────┴─────┐ ┌───┴────┐ ┌───────┴────────┐   │
│  │  Auth       │ │  Chat     │ │  AI    │ │  Payment      │   │
│  │  Controller │ │ Controller│ │Control │ │  Controller   │   │
│  └──────┬──────┘ └─────┬─────┘ └───┬────┘ └───────┬────────┘   │
│         │              │            │               │           │
│  ┌──────┴──────────────┴────────────┴───────────────┴────────┐  │
│  │                    Middleware Layer                        │  │
│  │  authMiddleware  │  errorMiddleware  │  validateRequest   │  │
│  └───────────────────────────────────────────────────────────┘  │
│         │                                                       │
│  ┌──────┴──────────────┐                                        │
│  │     Mongoose        │                                        │
│  └──────┬──────────────┘                                        │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐   ┌──────────────────┐   ┌───────────────┐
│    MongoDB Atlas    │   │   Groq API       │   │  Razorpay     │
│                     │   │  (LLM Inference) │   │  (Payments)   │
│  Collections:       │   └──────────────────┘   └───────────────┘
│  - users            │
│  - chats            │   ┌──────────────────┐
│  - subscriptions    │   │  Cloudinary      │
└─────────────────────┘   │  (Image Uploads) │
                          └──────────────────┘
```

## Key Design Decisions

### 1. No TypeScript
The project intentionally uses plain JavaScript (CommonJS on the server, ES Modules + JSX on the client). This reduces the build complexity and keeps the barrier to contribution low, but sacrifices compile-time type safety.

### 2. Embedded Messages in Chat Documents
Messages are embedded as a subdocument array within the Chat model rather than stored in a separate collection. This decision optimizes for the primary access pattern (loading a full chat conversation) at the cost of the 16 MB MongoDB document size limit — acceptable for text-only chat histories.

### 3. Server-Sent Events (SSE) for AI Streaming
The AI prompt endpoint uses SSE instead of WebSockets or polling. SSE is simpler to implement, works over standard HTTP, and is sufficient for unidirectional server-to-client streaming. The client uses the native `EventSource` API or manual `fetch` with `ReadableStream` to consume the stream.

### 4. JWT-Based Sessions
No server-side session store. Authentication state is entirely contained in a JWT stored in `localStorage`. This eliminates the need for Redis or database-backed sessions but makes token revocation impossible without a blocklist.

### 5. Flat Subscription Model
Subscription state is embedded in the User document (as a nested object) rather than in a separate Subscription collection, which is kept as a legacy reference. This avoids a join on every authenticated request that needs to check plan status.

### 6. Settings Synced to Server
User preferences (nickname, region, language, timezone, etc.) are stored in the User document's `settings` field (Maps). The client reads from the server on page load via `GET /api/auth/settings`, falls back to `localStorage`, and syncs changes to the server via `PUT /api/auth/settings`. This ensures preferences persist across devices and sessions.

### 7. Email via Resend
Password reset emails are sent through the Resend API. If `RESEND_API_KEY` is not configured, the reset token is logged to the console — safe for local development and testing. The API never returns the raw token in its response.

## Data Flow: AI Chat Request

```
1. User types a prompt in the ChatWindow component
2. Client POSTs to /api/chats (if new) or reuses existing chatId
3. POST /api/ai/prompt { chatId, prompt }
4. Server:
   a. Authenticates via JWT
   b. Validates request body
   c. Loads Chat document, checks ownership
   d. Loads User, checks subscription/usage limits
   e. Auto-downgrades expired Pro subscriptions
   f. Resets daily counter if UTC date changed
   g. Pushes user message to chat.messages[]
   h. Auto-generates title from first prompt
   i. Calls Groq API with full message history (streaming)
   j. Sets SSE headers on response
5. For each chunk from Groq:
   a. Server writes `data: {"token":"..."}\n\n` to the response
   b. Client parses SSE events, appends tokens to displayed message
6. When stream ends:
   a. Server pushes assistant message to chat.messages[]
   b. Server increments user.usage.dailyCount
   c. Server persists both documents
   d. Server writes `data: [DONE]\n\n` and ends response
7. Client renders complete message with Markdown and syntax highlighting
```

## Data Flow: Payment & Subscription

```
1. User clicks "Upgrade to Pro" on billing page
2. Client POSTs /api/payments/create-order (with optional coupon)
3. Server creates a Razorpay order, returns order ID + amount
4. Client opens Razorpay checkout modal with returned order details
5. User completes payment in Razorpay overlay
6. Razorpay returns payment_id + signature to client
7. Client POSTs /api/payments/verify with all three Razorpay fields
8. Server:
   a. Verifies HMAC-SHA256 signature
   b. Checks coupon redemption limits
   c. Sets user.subscription to { plan: "pro", status: "active", expiresAt }
   d. Returns success
9. Client refreshes billing state from /api/payments/status
```

## Hosting Topology

| Component | Provider | URL |
|---|---|---|
| Frontend | Netlify | `https://devflow-ai-client.netlify.app` |
| Backend | Render (free tier) | `https://devflow-api-ubnd.onrender.com` |
| Database | MongoDB Atlas (free tier) | — |
| AI Inference | Groq Cloud | — |
| Payments | Razorpay | — |
| Media Storage | Cloudinary | — |

**Note:** Render's free tier spins down after 15 minutes of inactivity, causing a 5–10 second cold start on the first request after idle.

## CORS Configuration

The server accepts requests from:

- `https://devflow-ai-client.netlify.app`
- `http://localhost:3000`
- `http://localhost:5173`
- Any URL listed in the `CLIENT_URL` or `CLIENT_URLS` environment variables (comma-separated)

Trailing slashes are normalized before comparison.
