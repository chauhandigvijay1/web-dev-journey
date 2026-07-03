<div align="center">
  <img alt="DsSync Hub" src="./client/public/logo_icon.svg" width="80" height="80">
  <h1>Security Policy</h1>
  <p><strong>Vulnerability reporting guidelines and architectural defense-in-depth protocols.</strong></p>
</div>

---

## Supported Versions

Security updates are actively provided for the following versions of DsSync Hub:

| Version | Supported          |
| ------- | ------------------ |
| >= 1.0.x| :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

We take the security of DsSync Hub and our users seriously. If you discover a security vulnerability, we ask that you report it privately rather than opening a public issue.

1. **Email the Maintainer**: Please send an email directly to `chauhandigvijay669@gmail.com` detailing the vulnerability.
2. **Details Required**: Include steps to reproduce the issue, a brief description of the potential impact, and your environment setup.
3. **SLA (Response Time)**: You can expect an initial acknowledgment within **48 hours**, and a status update on a fix within **72 hours**.

Please allow the core team time to patch and release a fix before publicly disclosing the vulnerability.

---

## Security Architecture

The following sections detail the defense-in-depth implementation across the DsSync Hub infrastructure.

> Defense-in-depth security architecture for DsSync Hub — covering authentication, authorization, data protection, rate limiting, and production hardening.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Authorization (RBAC)](#authorization-rbac)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [Rate Limiting](#rate-limiting)
5. [HTTP Security Headers](#http-security-headers)
6. [Cookie Security](#cookie-security)
7. [Password Policy](#password-policy)
8. [Token Security](#token-security)
9. [Database Security](#database-security)
10. [File Upload Security](#file-upload-security)
11. [Production Hardening](#production-hardening)
12. [Security Checklist](#security-checklist)

---

## Authentication

### JWT-Based Authentication

```javascript
// Token generation
jwt.sign(
  { id: user._id, tokenVersion: user.tokenVersion },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
)
```

- **Algorithm**: HS256 (symmetric)
- **Expiry**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Storage**: httpOnly cookie (primary) + `Authorization` header (fallback for non-browser clients)

### Token Verification Flow

```
1. Extract token from cookie (req.cookies.accessToken) or header (Authorization: Bearer <token>)
2. jwt.verify(token, JWT_SECRET) → payload { id, tokenVersion, iat, exp }
3. User.findById(payload.id)
4. Verify user.tokenVersion === payload.tokenVersion
5. req.user = userDocument
6. next()
```

### Token Versioning for Session Invalidation

Every User document has a `tokenVersion` field (defaults to 0). When a user:
- Changes their password → `tokenVersion += 1`
- Clicks "Logout all sessions" → `tokenVersion += 1`

All existing JWTs become invalid because the payload's `tokenVersion` no longer matches the database. The user must re-authenticate.

### Google OAuth 2.0

```javascript
const { GoogleAuth } = require('google-auth-library')
const client = new GoogleAuth.ClientId(process.env.GOOGLE_CLIENT_ID)

// Verify ID token
const ticket = await client.verifyIdToken({
  idToken: credential,
  audience: process.env.GOOGLE_CLIENT_ID,
})
const payload = ticket.getPayload()  // { email, name, sub, picture }
```

- Token verification happens server-side (not in the browser)
- Google's `sub` (subject) is stored as `googleId` for account linking
- If a user with the same email exists (from local signup), they can still link Google

### Email Verification

```
1. User registers → emailVerificationToken = crypt*randomBytes(32).toString('hex')
2. Email sent with verification link: /verify-email/{token}
3. User clicks link → server validates token + expiry (24h)
4. User.emailVerified = true
```

The token is stored as SHA-256 hash in the database (not plaintext). Verification links are single-use.

---

## Authorization (RBAC)

### Membership Model

Every workspace has members with one of four roles:

| Role | Weight | Can Read | Can Create | Can Manage Members | Can Delete |
|------|--------|----------|------------|-------------------|------------|
| `viewer` | 1 | ✓ | ✗ | ✗ | ✗ |
| `member` | 2 | ✓ | ✓ | ✗ | ✗ |
| `admin` | 3 | ✓ | ✓ | ✓ | ✗ |
| `owner` | 4 | ✓ | ✓ | ✓ | ✓ |

### Controller Enforcement Pattern

Every controller follows this exact pattern:

```javascript
const membership = await Membership.findOne({
  user: req.user._id,
  workspace: workspaceId,
  status: 'active',
})
if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

// Role-specific check
if (!canEditWorkspace(membership.role)) {
  return res.status(403).json({ success: false, message: 'Insufficient permission.' })
}
```

This pattern is repeated in:
- 14 Express controllers
- 4 Socket.io modules (chat, task, note, calendar)
- File upload and access endpoints

### Socket-Level Authorization

Socket.io events are NOT automatically authenticated by the Express middleware chain. We must verify membership inside each event handler:

```javascript
socket.on('task:created', async (data) => {
  const membership = await Membership.findOne({
    user: socket.userId,
    workspace: data.workspace,
    status: 'active',
  })
  if (!membership || membership.role === 'viewer') return
  // process event
})
```

---

## Input Validation & Sanitization

### Zod Schemas (Frontend + Validator Middleware)

```typescript
const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})
```

Zod provides:
- Type inference for TypeScript
- User-friendly error messages
- Runtime validation (secondary to HTML5 constraint validation)

### XSS Prevention Middleware

`sanitizeInput.js` strips dangerous characters from all request bodies:

```javascript
module.exports = (req, _res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/[<>{}$]/g, '')
      }
    }
  }
  next()
}
```

This runs after `express.json()` and before any route handler, providing application-wide XSS protection against `<script>`, template injection (`${}`), and HTML tag injection.

### File Upload Validation

```javascript
const validateIncomingFile = (file) => {
  if (!file) return 'A file is required.'
  if (!allowedMimeTypes.has(file.mimetype)) return 'This file type is not supported.'
  if (!allowedExtensions.has(getFileExtension(file.originalname))) return 'This file extension is not supported.'
  if (!file.size || file.size > 25 * 1024 * 1024) return 'Files must be 25MB or smaller.'
  return null
}
```

- **MIME whitelist**: 20 allowed types (images, PDF, office docs, audio, video)
- **Extension whitelist**: Matching set of allowed extensions
- **Size limit**: 25MB (configurable in multer setup)
- **Storage**: Multer memory storage → never touches disk until validated

---

## Rate Limiting

### Global Limiter

```javascript
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 500,                    // 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(globalLimiter)
```

### Auth-Specific Limiter

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 8,                     // 8 attempts per window
  message: { success: false, message: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
```

Applied to: `/auth/login`, `/auth/register`, `/auth/forgot-password`

### AI Usage Limiter

```javascript
// Per-workspace: 50 requests/day (free), 1000 requests/day (pro)
const { aiRequestsPerDay } = await getPlanLimits(workspaceId)
const today = new Date(); today.setHours(0, 0, 0, 0)
const count = await AiUsage.countDocuments({
  workspace: workspaceId,
  createdAt: { $gte: today },
})
if (count >= aiRequestsPerDay) {
  return res.status(429).json({ success: false, message: 'Daily AI limit reached.' })
}
```

---

## HTTP Security Headers

Configured via Helmet:

```javascript
app.use(helmet({
  crossOriginResourcePolicy: false,  // Needed for cross-origin file serving
}))
```

Helmet sets these headers by default:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Default | Prevents XSS by controlling resource loading |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `Strict-Transport-Security` | `max-age=15552000` | Enforces HTTPS |
| `X-XSS-Protection` | `0` | Disables legacy XSS filter (replaced by CSP) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer header |

`crossOriginResourcePolicy: false` is required because file assets are served from a different origin (Render → Vercel).

### CORS Configuration

```javascript
cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      ...(process.env.CLIENT_ORIGINS || '').split(','),
    ].filter(Boolean)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('CORS origin not allowed'))
  },
  credentials: true,
})
```

- Only known origins are allowed
- No wildcard (`*`) CORS — credentials: true requires explicit origins
- Socket.io has its own parallel CORS config in `server.js`

---

## Cookie Security

```javascript
const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
})
```

| Property | Value | Reason |
|----------|-------|--------|
| `httpOnly` | `true` | Prevents XSS from accessing the cookie via `document.cookie` |
| `sameSite` | `lax` | Prevents CSRF for state-changing requests, allows top-level navigation |
| `secure` | `true` (production) | Ensures cookie is only sent over HTTPS |
| `path` | `/` | Available across all routes |

The access token cookie is cleared:
- On explicit logout
- On password change (with `forceLogout: true` flag)
- On "logout all sessions"

---

## Password Policy

### Strength Requirements

```javascript
const isStrongPassword = (password) => {
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  return password.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial
}
```

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Hashing

```javascript
const hash = await bcrypt.hash(password, 12)  // 12 rounds
```

- **Algorithm**: bcrypt with salt
- **Rounds**: 12 (~250ms per hash on modern hardware)
- **Salt**: Automatic (embedded in hash output)
- **Storage**: `$2b$12$...` hash string in `passwordHash` field

### Password Reset Flow

```
1. User requests reset → generate crypt*randomBytes(32).toString('hex')
2. Store SHA-256(token) in passwordResetTokenHash
3. Set passwordResetExpiresAt = Date.now() + 60 * 60 * 1000 (1 hour)
4. Email reset link with plaintext token
5. User clicks link → hash token → compare with stored hash
6. Verify expiry
7. Allow password reset
```

- Token is hashed (SHA-256) before storage — database breach doesn't expose tokens
- 60-minute expiry limits the attack window
- Token is single-use (cleared after use)

---

## Token Security

### Invite Tokens

```javascript
const generateInviteToken = () => crypt*randomBytes(16).toString('hex')
```

- 32-character hex string (128 bits of entropy)
- Stored in plaintext in the Invite collection
- Expires in 7 days
- Single-use (cleared on accept)

### Password Reset Tokens

```javascript
const resetToken = crypt*randomBytes(32).toString('hex')
```

- 64-character hex string (256 bits of entropy)
- Only SHA-256 hash stored in database
- 60-minute expiry
- Single-use

### JWT Tokens

```javascript
jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: '7d' })
```

- 7-day expiry
- Token versioning for immediate invalidation
- Secret must be 64+ characters (random hex recommended)

---

## Database Security

### MongoDB Atlas Configuration

- **Network Access**: IP whitelist (or `0.0.0.0/0` for initial setup, lock down later)
- **Auth**: Database user with readWrite on the application database
- **TLS/SSL**: Enabled by default on Atlas connections
- **Mongoose**: Parameterized queries prevent injection

### Sensitive Fields

Fields marked `select: false` in Mongoose schemas are excluded from query results by default:

```javascript
passwordHash: { type: String, required: true, select: false },
emailVerificationToken: { type: String, select: false },
emailVerificationExpiresAt: { type: Date, select: false },
```

To access these fields, queries must explicitly use `.select('+passwordHash')`.

### No Secrets in Documents

- API keys are NEVER stored in the database
- JWT secrets are environment variables only
- Payment keys are environment variables only

---

## File Upload Security

### Validation Chain

```
1. HTTP request arrives → multer memoryStorage (no disk write)
2. fileController.validateIncomingFile:
   - MIME type whitelist (20 types)
   - Extension whitelist
   - Size limit (25MB)
3. fileController.ensureStorageAvailable:
   - Plan-based storage quota check
4. storageService.storeFile:
   - Sanitize filename (remove special chars, truncate to 80 chars)
   - Generate random token (crypt*randomBytes(10).toString('hex'))
   - Write to disk or upload to Cloudinary
5. FileAsset.create:
   - Store metadata only (not file contents) in MongoDB
```

### Storage Path Safety

```javascript
const safeBaseName = (value = '') =>
  String(value)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')  // Replace dangerous chars
    .replace(/-+/g, '-')                   // Collapse multiple dashes
    .replace(/^-|-$/g, '')                 // Trim leading/trailing dashes
    .slice(0, 80)                          // Limit length
```

### Access Control

Files can only be accessed by workspace members:
```javascript
const fileAsset = await FileAsset.findOne({ name: storedName })
if (!fileAsset) return res.status(404)
const membership = await Membership.findOne({
  user: req.user._id,
  workspace: fileAsset.workspace,
  status: 'active',
})
if (!membership) return res.status(403)
```

---

## Production Hardening

### Error Handling

```javascript
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    - 'Internal server error'
    : err.message

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  res.status(statusCode).json({ success: false, message })
}
```

- **No stack traces in production**: Generic error message for 500s
- **Validation errors**: Specific messages returned (safe to expose)
- **Sentry capture**: When configured, all errors are captured for analysis

### Environment Variables

- Zero `.env` files in GitHub repository (`.env` is in `.gitignore`)
- All secrets via GitHub Secrets → injected into Render/Vercel at deploy time
- Different values for development vs production

### CI/CD Security

- GitHub Actions does NOT have access to production secrets during PR builds
- Secrets are only available on push to `main` branch
- No `.env` files in the repository

---

## Security Checklist

### Pre-Launch

- [x] JWT token versioning implemented
- [x] bcrypt 12 rounds for password hashing
- [x] Password strength validation (8+ chars, mixed case, number, special)
- [x] Password reset tokens are SHA-256 hashed before storage
- [x] Email verification flow with 24-hour token expiry
- [x] Helmet security headers configured
- [x] CORS whitelist configured (no wildcard)
- [x] Rate limiting on auth endpoints (8/15min)
- [x] Global rate limiting (500/15min)
- [x] Input sanitization strips `<>{}$`
- [x] File upload MIME type whitelist
- [x] File upload extension whitelist
- [x] File upload size limit (25MB)
- [x] Multer memory storage (no disk write until validated)
- [x] httpOnly cookies for JWT
- [x] SameSite cookie policy (`lax`)
- [x] No stack traces in production error handler
- [x] All 15 route modules have auth middleware on protected routes
- [x] All 15 controllers verify workspace membership
- [x] All 4 socket modules verify workspace membership
- [x] Sensitive DB fields have `select: false`
- [x] `.env` files in `.gitignore`

### Post-Launch Monitoring

- [ ] Enable Sentry error monitoring (set `SENTRY_DSN`)
- [ ] Enable Redis rate limiting (set `REDIS_URL`)
- [ ] Review MongoDB Atlas access logs
- [ ] Monitor failed login attempts
- [ ] Review file upload patterns
- [ ] Rotate JWT secret periodically
- [ ] Rotate email app password periodically
- [ ] Audit active sessions

---

<div align="center">
  <a href="docs/testing.md">← Previous: Testing</a> | <a href="./README.md">🏠 Home</a> | <a href="docs/challenges.md">Next: Challenges →</a>
</div>
