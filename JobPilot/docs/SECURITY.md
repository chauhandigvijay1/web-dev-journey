# Security Documentation

## Security Philosophy

JobPilot adopts a **defense-in-depth** approach: every layer of the stack — from the database driver to the browser extension — implements its own security controls. The system assumes that any single layer can be bypassed and relies on overlapping, independent protections.

Key principles:
- **Fail closed**: authentication errors default to `401 Unauthorized`, never to grant access
- **Principle of least privilege**: extension `host_permissions` scoped to specific domains; API rate limits per endpoint tier
- **Defense in depth**: multiple independent controls for the same attack vector (e.g., input sanitization + parameterized queries + schema validation)
- **No silent failures**: startup validation rejects weak secrets or invalid configuration before serving traffic

---

## Authentication Security

### Password Hashing (bcrypt)

- **Algorithm**: `bcrypt` with salt rounds = 10
- **Pre-save hook**: `User.pre("save")` automatically hashes the password when modified
- **Selective loading**: `password` field has `select: false` — never included in query results unless explicitly requested via `.select("+password")`
- **Password oracle eliminated**: `bcrypt.compare()` runs on every login attempt regardless of whether the user exists; the response message is identical (`"Invalid credentials"`) whether the email is unknown or the password is wrong

### JWT Dual-Token Architecture

| Token | Location | TTL | Purpose |
|---|---|---|---|
| **Access Token** | `Authorization: Bearer` header | 7 days (configurable via `JWT_ACCESS_TTL`) | Authenticates API requests |
| **Refresh Token** | HTTP-only cookie (`jobpilot_refresh`) | 30 days (configurable via `JWT_REFRESH_TTL`) | Issues new access tokens without re-authentication |

- **Separate secrets**: `JWT_SECRET` and `JWT_REFRESH_SECRET` are distinct required environment variables
- **Secret validation**: both secrets are validated at startup to be ≥32 characters — the server refuses to start if either is too short
- **Token binding**: access tokens include `{ userId, type: "access", tokenVersion }`; refresh tokens include `{ userId, type: "refresh", sessionId, tokenVersion }`

### Session Invalidation (tokenVersion)

Each user document has a `tokenVersion` field (default `0`). When a user changes their password:

1. `tokenVersion` is incremented (`user.tokenVersion += 1`)
2. All existing refresh tokens are invalidated via `clearUserSession()` (wipes `refreshTokenHash`, `refreshSessionId`, `refreshTokenExpiresAt`)
3. The `protect` middleware checks `decoded.tokenVersion >= user.tokenVersion` — any token issued before the version bump is rejected

### Refresh Token Rotation

- Each refresh token is bound to a unique `sessionId` (UUID generated via `crypto.randomUUID()`)
- On refresh, `createAuthSession()` generates a completely new refresh token with a new `sessionId`
- The old token's hash is overwritten in the database — replay of an old refresh token fails hash comparison
- `refreshTokenHash` is stored with `select: false` and never exposed to the client

### Refresh Cookie Hardening

```javascript
{ httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 30 * 24 * 60 * 60 * 1000 }
```

`secure: true` is only applied in production to support local development over HTTP.

---

## API Security

### Rate Limiting (Three Tiers)

| Tier | Window | Max Requests | Applied To |
|---|---|---|---|
| API | 15 minutes | 250 | All `/api/*` routes |
| Auth | 10 minutes | 12 | Login, register, password change |
| AI | 15 minutes | 20 | AI-powered features |

All rate limiters use `express-rate-limit` with standard headers (`RateLimit-*`) and no legacy headers. Config values are environment-driven with sensible defaults.

### CORS Whitelist

```javascript
allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "https://jobpilot-client-chi.vercel.app",
  // + any FRONTEND_URL or CORS_ORIGINS entries
]);
```

- **Null origin**: requests without an `Origin` header are allowed (server-to-server, extension)
- **Chrome extension**: any `chrome-extension://` origin is automatically allowed after trailing slash normalization
- **Loopback**: `localhost`, `127.0.0.1`, `::1` origins are always allowed
- **Credentials**: `credentials: true` enables cookie-based refresh token flow

### Input Sanitization

The `sanitizeRequest` middleware recursively strips from `req.body` and `req.query`:

- Keys starting with `$` (MongoDB operator injection prevention)
- Keys containing `.` (Mongoose path traversal prevention)
- Keys matching `__proto__`, `constructor`, `prototype` (prototype pollution prevention)
- Null bytes (`\u0000`) are removed from string values

### HTTP Security Headers (Helmet)

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | 2-year HSTS with preload |
| `X-Frame-Options` | `DENY` | Clickjacking prevention |
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing prevention |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage control |
| `Cross-Origin-Resource-Policy` | (disabled — `false`) | Required by chrome-extension origins |

### Additional Protections

- **hpp** (HTTP Parameter Pollution): prevents duplicate query parameter attacks
- **compression**: gzip/brotli response compression enabled globally
- **`x-powered-by`**: disabled (removes Express fingerprinting header)
- **`trust proxy`**: set to `1` so rate limiters see the real client IP behind proxies

---

## Data Security

### MongoDB Injection Prevention

- Parameterized queries are guaranteed by Mongoose (MongoDB driver handles escaping)
- Input sanitization strips `$`-prefixed keys as a defense-in-depth measure
- Schema-level `enum` validation restricts status fields to known values
- `trim: true` and `lowercase: true` on email/username normalize inputs before query or storage

### SSRF Protection

The job extraction service (`job-extraction/index.js`) implements SSRF guards on URL-based extraction:

1. **Protocol restriction**: only `http:` and `https:` URLs are accepted
2. **Private IP blocklist** (`isPrivateHostname`):
   - `localhost`, `127.0.0.1`, `::1`
   - RFC 1918 ranges: `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`
   - Link-local: `169.254.x.x`
   - `0.0.0.0`
3. **Request timeout**: 15 seconds with 5 max redirects
4. **Custom User-Agent**: `JobPilotBot/2.0` for traceability
5. **URL validation**: `new URL(urlString)` is wrapped in try-catch; invalid URLs return a warning instead of crashing

### Null Origin Rejection

The CORS middleware implicitly rejects `null` origins from non-browser contexts (e.g., Postman, curl) when no origin header is present — the behavior is to block with a 403 error unless the origin is explicitly whitelisted or absent.

---

## Client Security

### LocalStorage Safety

All `localStorage` operations (used to persist auth tokens and user data on the Next.js frontend) are wrapped in try-catch blocks. If `localStorage` is unavailable (private browsing, storage quota exceeded, SSR), the system falls back to an in-memory `Map`:

```typescript
function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return memoryStorage.get(key) ?? null; }
}
```

### Extension Storage Safety

The Chrome extension wraps all `chrome.storage.local` calls in try-catch with an in-memory `Map` fallback, ensuring the extension continues to function even if the storage API is blocked or unavailable.

### AbortController for API Calls

- **Frontend (Next.js)**: Axios instance configured with `timeout: 30000` (30 seconds)
- **Extension**: `fetchWithRetry` uses `AbortController` with `timeout: 10000` (10 seconds) and 3 retry attempts with exponential backoff (1s, 2s, 4s)

### Content Security Policy

**Web App (via Helmet):** Default CSP applied by Helmet (protects the Next.js frontend from XSS).

**Extension (`manifest.json`):**
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

This restricts all script execution in extension pages to the extension's own bundle — no inline scripts, no eval, no CDN-sourced scripts.

---

## Network Security

### Request IDs

Every HTTP request is assigned a unique trace ID via `crypto.randomUUID()` and attached to `req.id`. This ID is included in all structured log entries, enabling end-to-end request tracing through the log stream.

### Structured Logging

```javascript
[2026-07-01T12:00:00.000Z] [ERROR] [550e8400-e29b-41d4-a716-446655440000] Unhandled error { "reqId": "...", "method": "POST", "url": "/api/auth/login" }
```

### Error Message Safety

- **Production**: stack traces are never returned in API responses (`err.stack` is stripped when `NODE_ENV === "production"`)
- **User-facing errors**: all error responses contain safe, generic messages (`"Invalid credentials"`, `"Not authorized"`, `"Not found"`) — no implementation details, no stack traces, no internal paths
- **Duplicate detection**: MongoDB `E11000` errors are mapped to user-safe messages in `duplicateFieldMessage()` before reaching the response

---

## Extension Security

### Content Script Isolation

Content scripts run in an isolated world — they cannot access page-defined JavaScript variables or DOM event handlers, preventing interference from or with the host page.

### Host Permissions Scoping

The extension declares explicit `host_permissions` for ~30 known job board domains, plus `localhost` and the production web app URL — no broad `*://*/*` access.

### CSP for Extension Pages

The popup (`popup.html`) is locked down with `script-src 'self'` — no inline event handlers, no dynamic script evaluation.

### Token Lifecycle

- Tokens are stored in `chrome.storage.local` (with in-memory Map fallback)
- A periodic cleanup timer runs every hour to remove expired tokens
- Token expiry is checked both by JWT `exp` claim and a hard 7-day TTL from `iat`
- 401 responses trigger automatic token deletion and a re-sync request to the web app

---

## Security Score Overview

| Dimension | Score | Strengths | Gaps |
|---|---|---|---|
| **Authentication** | 9/10 | bcrypt, dual JWT, tokenVersion, refresh rotation, password oracle elimination | No account lockout after failed attempts |
| **API Security** | 9/10 | Rate limiting (3 tiers), CORS whitelist, input sanitization, helmet, hpp | — |
| **Data Security** | 8/10 | MongoDB injection prevention, SSRF protection, schema validation | No request payload size limits beyond 2MB JSON limit |
| **Client Security** | 8/10 | localStorage safety, AbortController, CSP (extension), fetchWithRetry | No subresource integrity (SRI) on loaded scripts |
| **Network Security** | 7/10 | Request IDs, structured logging, safe error messages | No centralized monitoring or audit trail |
| **Extension Security** | 9/10 | Scoped host_permissions, CSP, isolated worlds, storage fallback | — |
| **CSRF Protection** | 4/10 | `sameSite: "lax"` on refresh cookie, no anti-CSRF tokens | No CSRF tokens on state-changing endpoints |
| **Operational Security** | 7/10 | Startup validation (JWT secrets, timezone), unhandled rejection handler | No security-focused load tests |
| **Overall** | **8.2/10** | — | — |

---

## Deployment Security Checklist

Before deploying to production, verify:

- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are set to unique values ≥32 characters
- [ ] `NODE_ENV=production` — disables stack traces in error responses, enables secure cookies
- [ ] `MONGO_URI` uses a MongoDB Atlas connection string with IP whitelist or VPC peering
- [ ] `CORS_ORIGINS` lists only known frontend origins (remove `http://localhost:*` for production-only)
- [ ] Rate limit thresholds are appropriate for expected traffic
- [ ] SMTP credentials are configured (or email features are disabled)
- [ ] Google OAuth client ID is configured (or Google sign-in is disabled)
- [ ] `DEFAULT_TIMEZONE` is a valid IANA timezone string
- [ ] TLS/SSL is terminated at the load balancer or reverse proxy
- [ ] Database user has minimal required privileges (readWrite on the application database only)
- [ ] Extension `host_permissions` list is reviewed and scoped to required domains only
- [ ] `.env` files are excluded from version control (verified in `.gitignore`)
- [ ] Unhandled promise rejection handler is active (logs warnings instead of crashing)
- [ ] Logs are shipped to a centralized logging service (optional but recommended)

---

## Known Gaps and Roadmap

### 1. CSRF Protection (Priority: High)

Current protection relies solely on `SameSite: "lax"` cookie attribute. For production deployments, implement:

- **Double-submit cookie pattern**: a random CSRF token set as a non-HTTP-only cookie and verified against a custom header on all mutating requests
- **Origin/Referer header validation**: verify that state-changing requests originate from the expected frontend origin
- **Idempotency tokens**: prevent accidental duplicate submissions on the reminder and job creation endpoints

### 2. Account Lockout (Priority: High)

Implement exponential backoff on failed login attempts:

- Track consecutive failures per email/IP in a rate-limited store (Redis or in-memory)
- Lock account for 15 minutes after 10 failed attempts (configurable)
- Notify user via email when a lockout is triggered
- Differentiate between IP-based and account-based lockout

### 3. Centralized Monitoring (Priority: Medium)

- Integrate with Sentry, DataDog, or similar for real-time error tracking
- Set up alerting on rate limit threshold breaches (>80% of limit)
- Monitor failed authentication attempts per IP and per account
- Dashboard for reminder delivery success/failure rates

### 4. Security Audit Trail (Priority: Medium)

- Log all state-changing operations (job create/update/delete, password change, profile update)
- Store audit logs in a separate collection or external service
- Include `req.id`, `userId`, IP address, user-agent, and action type
- Implement retention policy (90 days default, configurable)

### 5. Multi-Factor Authentication (Priority: Low)

- TOTP-based 2FA using `otplib` or `speakeasy`
- Backup recovery codes provisioned at setup
- MFA enrollment endpoint with QR code generation
- Session-bound MFA (re-verify on new device login only)
