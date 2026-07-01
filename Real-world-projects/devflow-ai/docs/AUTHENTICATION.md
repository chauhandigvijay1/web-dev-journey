# DevFlow AI — Authentication & Authorization

## Overview

DevFlow AI uses a **JWT-based stateless authentication** system. There is no server-side session store. All authentication state is contained in a JSON Web Token stored in the client's `localStorage`.

## Auth Flow Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │  MongoDB │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  POST /auth/signup │                    │
     │  {name, username,  │                    │
     │   email, password} │                    │
     ├───────────────────>│                    │
     │                    │  Create User       │
     │                    │  Create Sub (leg.) │
     │                    ├───────────────────>│
     │                    │<───────────────────│
     │  {token, user}     │                    │
     │<───────────────────│                    │
     │                    │                    │
     │  Store token in    │                    │
     │  localStorage      │                    │
     │  ("devflow_token") │                    │
     │                    │                    │
     │  GET /auth/me      │                    │
     │  Authorization:    │                    │
     │  Bearer <token>    │                    │
     ├───────────────────>│                    │
     │                    │  Verify JWT        │
     │                    │  Find User by ID   │
     │                    │  Check !isDeleted  │
     │                    ├───────────────────>│
     │                    │<───────────────────│
     │  {user}            │                    │
     │<───────────────────│                    │
```

## Registration

Two registration endpoints exist:

| Endpoint | Fields | Use Case |
|---|---|---|
| `POST /api/auth/register` | name, email, password | Quick signup without username |
| `POST /api/auth/signup` | name, username, email, password | Full signup with custom handle |

Both endpoints:
1. Validate input (name length, email format, password strength, disposable email check)
2. Check for duplicate email/username
3. Hash password with bcrypt (12 salt rounds)
4. Create the `User` document
5. Create a legacy `Subscription` document
6. Sign a JWT with payload `{ id: user._id, role: user.role }`
7. Return `{ token, user }`

## Login

`POST /api/auth/login` accepts either `identifier` (email or username) or `email`:

1. Query: `User.findOne({ $or: [{ email }, { username }], isDeleted: { $ne: true } }).select("+password")`
2. Compare password with `bcrypt.compare()`
3. Sign JWT (7-day expiry)
4. Return `{ token, user }`

## Token Details

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Payload | `{ id: ObjectId, role: String, iat, exp }` |
| Secret | `JWT_SECRET` environment variable |
| Expiry | `JWT_EXPIRES_IN` (default: `7d`) |
| Storage (client) | `localStorage` key: `devflow_token` (also reads legacy key `token`) |
| Transmission | `Authorization: Bearer <token>` header |

## Middleware: `protect`

Applied to all routes except `/api/auth/login`, `/api/auth/register`, `/api/auth/signup`, `/api/auth/forgot-password`, `/api/auth/reset-password`, and `/api/health`.

```javascript
const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) throw new AppError("Unauthorized", 401);

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.id);

  if (!user || user.isDeleted) throw new AppError("User not found", 401);

  req.user = user;
  next();
});
```

**What it checks:**
- Presence of `Bearer <token>` header
- JWT validity (signature, expiry)
- User existence in the database
- Soft-delete status (`isDeleted` flag)

## Middleware: `authorize(roles)`

Role-based access control. Currently only `"user"` and `"admin"` roles exist.

```javascript
const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("Forbidden", 403));
  }
  return next();
};
```

## Password Reset Flow

```
┌──────────┐              ┌──────────┐              ┌──────────┐
│  Client  │              │  Server  │              │  Resend  │
└────┬─────┘              └────┬─────┘              └────┬─────┘
     │                         │                         │
     │ POST /auth/forgot-password                         │
     │ { email }               │                         │
     ├────────────────────────>│                         │
     │                         │ crypto.randomBytes(32)  │
     │                         │ SHA256 hash → store     │
     │                         │ in MongoDB              │
     │                         │                         │
     │                         │ Send email via Resend   │
     │                         ├────────────────────────>│
     │                         │<────────────────────────│
     │ { success, message,     │                         │
     │   expiresInMinutes: 15 }│                         │
     │<────────────────────────│                         │
     │                         │                         │
     │ (User clicks link in    │                         │
     │  email, arrives at      │                         │
     │  /reset-password?token) │                         │
     │                         │                         │
     │ POST /auth/reset-password                         │
     │ { token, newPassword }  │                         │
     ├────────────────────────>│                         │
     │                         │ SHA256(token) → find    │
     │                         │ check expiry            │
     │                         │                         │
     │ { success: true }       │                         │
     │<────────────────────────│                         │
```

1. Client sends email to `POST /api/auth/forgot-password`
2. Server generates `crypto.randomBytes(32)` → hex string (raw token)
3. SHA-256 hash of raw token is stored in `user.resetPasswordToken` in MongoDB
4. Expiry is set to 15 minutes in `user.resetPasswordExpires`
5. Server sends the raw token via **Resend** email API to the user's email address with a `reset-password?token=...` link. The email includes a branded HTML template with the project name and styling.
6. If `RESEND_API_KEY` is not configured, the token is logged to console (safe for local development)
7. The API always returns the generic response `{ expiresInMinutes: 15 }` — the raw token is never returned in the API response
8. Client sends `{ token, password }` to `POST /api/auth/reset-password`
9. Server SHA-256 hashes the provided token and looks up the user
10. If valid and unexpired, the password is updated and the reset fields are cleared

## Account Deletion

`DELETE /api/auth/me` performs a **soft delete**:

1. Sets `isDeleted: true`
2. Sets `deletedAt: new Date()`
3. Appends `_deleted_{timestamp}` to `email` and `username` (frees them for reuse)
4. Saves without validation

After deletion:
- The user's JWT continues to be technically valid (no blocklist), but the `protect` middleware rejects them because `user.isDeleted` is true
- The email/username can be reused immediately by a new registration

## Client-Side Auth

### Token Storage
```javascript
// Stored on successful login/signup
localStorage.setItem("devflow_token", token);

// Read by Axios interceptor
const token = localStorage.getItem("devflow_token") || localStorage.getItem("token");
config.headers.Authorization = `Bearer ${token}`;
```

### Protected Routes
The `ProtectedRoute` component wraps pages that require authentication:

```javascript
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("devflow_token") || localStorage.getItem("token");
  if (!token) router.replace("/login");
  return token ? children : null;
}
```

Protected pages:
- `/dashboard`
- `/chat/[id]`
- `/settings`
- `/settings/billing`
- `/pricing`
- `/account`

### Redux State
The `authSlice` manages:
- `token` — JWT string
- `user` — User object (from `mapUser` sanitization)

Actions:
- `setCredentials` — stores token + user, persists token to localStorage
- `logout` — clears state and localStorage
- `hydrateAuth` — rehydrates from localStorage on page load

## Security Considerations

### Current Strengths
- Passwords hashed with bcrypt (12 rounds)
- JWT uses strong HMAC-SHA256
- Disposable email domain blocklist
- Strong password policy (8+ chars, upper + lower + digit)
- Soft delete preserves data integrity
- Reset tokens are single-use, time-limited (15 min), and stored as SHA-256 hashes

### Current Limitations
- **No token revocation:** A compromised JWT is valid until expiry (up to 7 days)
- **No refresh tokens:** Token cannot be rotated without re-authentication
- **No rate limiting on auth endpoints** (beyond the global 300/15min limit)
- **No email verification:** Accounts are active immediately after signup
- **No MFA/2FA**
- **No HTTPS enforcement** in application code (relies on infrastructure)
