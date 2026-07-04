<div align="center">
  <img src="./docs/assets/screenshots/logo.svg" alt="JobPilot Logo" width="160" />
  <h1>Security Documentation</h1>
  <p><em>Defense-in-depth architecture, threat models, and operational security guidelines.</em></p>
</div>

---

## 📑 Table of Contents

1. [Security Philosophy](#-security-philosophy)
2. [Authentication Security](#-authentication-security)
3. [API Security Boundaries](#-api-security-boundaries)
4. [Data & Injection Defenses](#-data--injection-defenses)
5. [Client & Extension Security](#-client--extension-security)
6. [Network & Operational Security](#-network--operational-security)
7. [Security Score & Audit](#-security-score--audit)
8. [Deployment Security Checklist](#-deployment-security-checklist)
9. [Roadmap & Hardening](#-roadmap--hardening)

---

## 🛡️ Security Philosophy

JobPilot adopts a strict **Defense-in-Depth** methodology. Every layer of the stack — from the database driver to the browser extension — implements its own security controls. The system assumes that any single layer can be bypassed.

- **Fail Closed**: Authentication errors default to `401 Unauthorized`.
- **Principle of Least Privilege**: Extension `host_permissions` are scoped to specific domains; API rate limits operate on tiered endpoint priority.
- **No Silent Failures**: Startup validation actively rejects weak secrets or invalid configurations before serving live traffic.

---

## 🔐 Authentication Security

### Password Hashing (bcrypt)
- **Algorithm**: `bcrypt` with salt rounds = 10.
- **Pre-save Hook**: `User.pre("save")` automatically hashes the password when modified.
- **Selective Loading**: The `password` field enforces `select: false` — never included in query results unless explicitly requested.
- **Password Oracle Eliminated**: `bcrypt.compare()` executes on every login attempt regardless of whether the user exists, ensuring identical timing responses to prevent credential harvesting.

### JWT Dual-Token Architecture

| Token | Location | Default TTL | Purpose |
|-------|----------|-------------|---------|
| **Access Token** | `Authorization: Bearer` Header | `15m` | Authenticates rapid API requests. |
| **Refresh Token** | `httpOnly` Cookie (`jobpilot_refresh`) | `30d` | Issues new access tokens seamlessly. |

- **Secret Validation**: Both `JWT_SECRET` and `JWT_REFRESH_SECRET` are validated at startup to be ≥ 32 characters.
- **Token Binding**: Access tokens bind `{ userId, type: "access", tokenVersion }`.

### Session Invalidation (tokenVersion)
When a user updates their password:
1. The database integer `tokenVersion` increments by `1`.
2. All existing refresh tokens are wiped via `clearUserSession()`.
3. The Express middleware validates `decoded.tokenVersion >= user.tokenVersion`, instantly rejecting any outstanding tokens worldwide.

### Refresh Token Rotation & Hardening
- Every refresh token binds to a unique `sessionId` (`crypto.randomUUID()`).
- On refresh, a completely new token and `sessionId` are generated.
- **Cookie Security**: `{ httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 30d }`

---

## 🧱 API Security Boundaries

### Three-Tiered Rate Limiting

| Tier | Time Window | Max Requests | Target Routes |
|------|-------------|--------------|---------------|
| **Global API** | 15 Minutes | 250 | All general `/api/*` endpoints. |
| **Auth** | 10 Minutes | 12 | `/login`, `/register`, password changes. |
| **AI Inference**| 15 Minutes | 20 | `/api/ai/*` (Protects Groq quotas). |

### CORS Whitelist
The CORS middleware enforces explicit origins:
- `http://localhost:3000` / `3001`
- `https://jobpilot-client-chi.vercel.app`
- Null origins are permitted specifically for Extension and Server-to-Server communication.

### Input Sanitization Middleware
Before hitting controllers, `req.body` and `req.query` are aggressively sanitized:
- Strips keys starting with `$` (NoSQL Injection).
- Strips keys containing `.` (Path Traversal).
- Strips `__proto__` and `constructor` (Prototype Pollution).

### HTTP Security Headers (Helmet)

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; preload` | 2-year HSTS enforcement. |
| `X-Frame-Options` | `DENY` | Clickjacking prevention. |
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing prevention. |

---

## 🗄️ Data & Injection Defenses

### MongoDB Safeguards
- Mongoose drivers guarantee parameterized queries (handles escaping).
- Schema-level `enum` validation restricts fields to explicit arrays.

### SSRF Protection (URL Extraction)
The web scraper (`job-extraction/index.js`) mitigates Server-Side Request Forgery via:
1. **Protocol Restriction**: Only `http:` and `https:` allowed.
2. **IP Blocklist**: Node's `net.isIP()` proactively drops RFC 1918 ranges (`10.x.x.x`, `192.168.x.x`), Link-local (`169.254.x.x`), and Loopback (`127.0.0.1`).
3. **Timeout Guards**: 15-second cap with a maximum of 5 redirects.

---

## 💻 Client & Extension Security

### Extension Content Script Isolation
Content scripts run in isolated Chrome environments, preventing interference from host-page DOM event handlers.
- **Host Permissions**: Explicitly scoped to 30+ Job Board domains. No wildcard `*://*/*` tracking.
- **CSP**: Extension `popup.html` locked via `script-src 'self'`.
- **Token Lifecycle**: `chrome.storage.local` tokens expire via hard 7-day TTLs and active 401 listeners.

### LocalStorage Defenses (Next.js)
All `localStorage` calls are wrapped in `try-catch` blocks. If storage is blocked (e.g., Safari Private Browsing), state gracefully degrades to an in-memory `Map`.

---

## 📡 Network & Operational Security

- **Request Trace IDs**: Every HTTP request is tagged via `crypto.randomUUID()` attached to `req.id` for end-to-end log tracing.
- **Error Message Safety**: `NODE_ENV=production` strips all stack traces. MongoDB `E11000` collisions are masked behind generic `"Duplicate Entry"` user messages.

---

## 📊 Security Score & Audit

| Dimension | Score | Strengths | Gaps |
|-----------|-------|-----------|------|
| **Authentication** | 9/10 | bcrypt, dual JWT, tokenVersion rotation. | No account lockout thresholds. |
| **API Security** | 9/10 | 3-tier rate limiting, input sanitization. | — |
| **Data Security** | 8/10 | SSRF mitigation, Schema Enum validation. | Request payload uncapped beyond 2MB. |
| **Client Security** | 8/10 | AbortControllers, LocalStorage fallbacks. | No subresource integrity (SRI). |
| **Overall Rating** | **8.2/10**| Robust Enterprise Readiness. | Phase 2 hardening required for CSRF. |

---

## 🚀 Deployment Security Checklist

Before merging to production, administrators must verify:
- [ ] `JWT_SECRET` & `JWT_REFRESH_SECRET` are injected and ≥32 chars.
- [ ] `NODE_ENV=production` is strictly enabled to mask stack traces.
- [ ] `MONGO_URI` utilizes AWS VPC peering or strict IP Whitelisting.
- [ ] Unhandled promise rejection handlers are active (Winston logger).
- [ ] TLS/SSL termination is active at the Vercel/Render load balancer.

---

## 🔮 Roadmap & Hardening

**Priority 1: CSRF Protection**
Transitioning from `SameSite: Lax` to a Double-Submit Cookie pattern with explicit Origin Header validation.

**Priority 2: Brute-Force Account Lockouts**
Implementing exponential backoff via Redis. Locking accounts for 15 minutes after 10 failed authentications.

**Priority 3: Centralized Monitoring**
Routing all `req.id` tagged Winston logs directly into DataDog / Sentry for real-time anomaly alerts.

<br/>
<div align="center">
  <strong>Next Reading:</strong> <a href="./CONTRIBUTING.md">Contributing Guidelines →</a>
</div>
