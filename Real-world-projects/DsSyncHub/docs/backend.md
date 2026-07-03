<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Backend Architecture</h1>
  <p><strong>The Node.js Express monolith: data flow, services, and real-time infrastructure.</strong></p>
</div>

---

## 🚀 System Context & Tech Stack

The backend is engineered as a highly cohesive monolith prioritizing execution speed, type safety across domains, and a low barrier to entry for open-source contributors.

- **Runtime**: Node.js 20
- **Framework**: Express 5 (Chosen specifically for native Promise resolution, eliminating the need for `try/catch` wrapper utilities across 17 controllers).
- **Database ODM**: Mongoose 8 (Managing 17 distinct relational schemas).
- **Real-Time Engine**: Socket.io 4
- **Security**: JWT (Token Versioning), bcrypt (12 rounds), Helmet, and rate-limiting.
- **Observability**: Pino (Structured Logging) and Sentry (Error Tracking).

---

## 📂 Component View (Directory Architecture)

The `server/src/` directory strictly enforces the separation of concerns. Business logic never bleeds into the routing layer.

```text
server/src/
├── config/         # Environment, Database, and 3rd-party initializations
├── routes/         # 17 Express Router definitions mapping URLs to Controllers
├── middleware/     # 6 Edge-security modules guarding route execution
├── controllers/    # 17 modules handling HTTP request/response lifecycles
├── services/       # Decoupled business logic (AI, Storage, Email)
├── models/         # 17 Mongoose schemas with strict validations
├── socket/         # 4 Socket namespaces (chat, task, note, calendar)
├── scripts/        # Node-cron background jobs
└── utils/          # Cryptography and input validation helpers
```

---

## 🔄 The Request Lifecycle

Every inbound API request traverses a strict, layered middleware pipeline before ever touching business logic. This guarantees the backend is secure by default.

1. **`validateRequest`**: Zod/Joi validation ensures the JSON payload exactly matches the expected schema.
2. **`sanitizeInput`**: A global XSS firewall strips malicious vectors (e.g., `<script>`, `$where`) from all query parameters and body payloads.
3. **`authMiddleware`**: Verifies the JWT signature and token version, hydrating `req.user` for downstream usage.
4. **`adminMiddleware`**: (Route specific) Enforces platform-level RBAC by ensuring `req.user.role === 'admin'`.

---

## ⚡ Asynchronous & Real-Time Engines

Heavy processing is completely decoupled from the HTTP response cycle to ensure endpoints return `200 OK` in under 50ms.

### 1. The Real-Time Engine (Socket.io)
We run 4 dedicated Socket namespaces (`chat`, `task`, `note`, `calendar`). 
When a user updates a task via a REST endpoint, the Controller updates MongoDB, and then synchronously triggers the Socket engine to broadcast the delta to all other connected clients in that workspace.

### 2. The Background Job Engine (Redis/Bull)
Heavy, non-blocking tasks are pushed to a Redis-backed **Bull Queue**:
- **`emailService.js`**: Nodemailer transports for invites and password resets are queued with exponential backoff and 3 automatic retries in case of SMTP failure.
- **Node-Cron**: A scheduled script (`cleanupExpiredTokens.js`) executes every 6 hours to autonomously purge expired invite and password reset tokens from MongoDB, preventing database bloat.

### 3. The Services Layer
External integrations are wrapped in robust, failure-resistant service classes:
- **`aiService.js`**: Connects to the Groq API. It implements fallback key rotation and strict 12-second timeouts to prevent the LLM from hanging the Node Event Loop.
- **`storageService.js`**: Implements a dual-storage abstraction, utilizing local filesystem storage for development and seamlessly falling back to Cloudinary for production persistence.

---

## 🚨 Enterprise Observability & Error Handling

Express 5 natively catches unhandled promise rejections inside asynchronous routes.

If an error occurs anywhere in the stack, it filters down to a centralized `errorHandler` middleware. This layer performs three critical functions:
1. Formats the error into a standardized JSON response.
2. Logs the failure structurally via **Pino**.
3. Pushes the error trace to **Sentry** for production monitoring.

> [!IMPORTANT]
> **Data Leakage Protection**: In the `production` environment, the error handler explicitly strips all stack traces from the JSON response to prevent exposing internal server architecture to malicious actors.

---

<div align="center">
  <a href="frontend.md">← Previous: Frontend</a> | <a href="../README.md">🏠 Home</a> | <a href="database.md">Next: Database →</a>
</div>
