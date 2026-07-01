# DevFlow AI — Environment Configuration

## Server Environment Variables

Location: `server/.env`

### Required Variables

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | — | MongoDB Atlas connection string (`mongodb+srv://...`) |
| `JWT_SECRET` | — | Secret key for signing JWTs (min 32 chars recommended) |
| `GROQ_API_KEY` | — | Groq Cloud API key for AI inference |

The server will **throw an error at startup** if any of these three variables are missing.

### Server Configuration

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Controls error detail in responses (`production` hides stack traces) |
| `PORT` | `5000` | HTTP server port |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry duration (ms, seconds, or string like `7d`) |

### CORS Configuration

| Variable | Default | Description |
|---|---|---|
| `CLIENT_URL` | — | Primary frontend URL (e.g., `https://devflow-ai-client.netlify.app`) |
| `CLIENT_URLS` | — | Comma-separated list of additional allowed CORS origins |

Fallback origins (always allowed):
- `https://devflow-ai-client.netlify.app`
- `http://localhost:3000`
- `http://localhost:5173`

### AI Integration

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | — | Groq Cloud API key (also required above) |
| `AI_MODEL` | `llama3-8b-8192` | Groq model ID for all completions |

### Razorpay (Payments)

| Variable | Default | Description |
|---|---|---|
| `RAZORPAY_KEY_ID` | `""` | Razorpay merchant key ID (test or live) |
| `RAZORPAY_KEY_SECRET` | `""` | Razorpay merchant key secret |
| `RAZORPAY_WEBHOOK_SECRET` | `""` | Webhook secret (currently unused) |
| `OWNER_COUPON` | `—` | Secret coupon code for 100% discount (no hardcoded fallback) |
| `OWNER_COUPON_DURATION` | `30` | Subscription duration in days for owner coupon |

### Resend (Email)

| Variable | Default | Description |
|---|---|---|
| `RESEND_API_KEY` | `""` | Resend API key for sending password reset emails |
| `EMAIL_FROM` | `""` | Sender email address for password reset emails (e.g., `noreply@yourdomain.com`) |

If `RESEND_API_KEY` is not configured, password reset tokens are logged to the console instead of being sent via email.

---

## Available Scripts

### Server (`server/package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `nodemon src/server.js` | Start dev server with hot reload |
| `start` | `node src/server.js` | Start production server |
| `test` | `node --experimental-vm-modules node_modules/.bin/jest --forceExit --detectOpenHandles` | Run unit tests (via `npm.cmd test`) |
| `lint` | `eslint src/` | Lint all source files |
| `lint:fix` | `eslint src/ --fix` | Lint and auto-fix |
| `format` | `prettier --write "src/**/*.js"` | Format all source files |

### Client (`client/package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev --webpack` | Start Next.js dev server |
| `build` | `next build` | Build for production |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run Next.js lint |
| `lint:strict` | `eslint app/ components/ lib/ store/` | Run ESLint on all source |
| `format` | `prettier --write "app/**/*.{js,jsx}" "components/**/*.{js,jsx}" "lib/**/*.js" "store/**/*.js"` | Format all source files |

---

## Configuration Files

The following configuration files have been added to the project root directories:

| File | Purpose |
|---|---|
| `server/.eslintrc.json` | ESLint configuration for Node.js server |
| `server/.prettierrc` | Prettier formatting rules (shared with client) |
| `server/jest.config.js` | Jest test runner configuration |
| `client/.eslintrc.json` | ESLint configuration for Next.js + React |
| `client/.prettierrc` | Prettier formatting rules |
| `server/.env.example` | Example environment file (no real secrets) |
| `client/.env.local.example` | Example client environment file |
| `.gitignore` | Excludes node_modules, .env, .next, coverage, etc. |

### Cloudinary (Media Uploads)

| Variable | Default | Alias |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | `""` | `CLOUDINARY_NAME` |
| `CLOUDINARY_API_KEY` | `""` | `CLOUDINARY_KEY` |
| `CLOUDINARY_API_SECRET` | `""` | `CLOUDINARY_SECRET` |

Aliases exist for backward compatibility. Using the primary variable names is recommended.

---

## Client Environment Variables

Location: `client/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g., `http://localhost:5000` or deployed Render URL) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Razorpay publishable key ID (NOT the secret) |

### Important: Razorpay Key ID vs Secret

The client environment variable `NEXT_PUBLIC_RAZORPAY_KEY_ID` must contain the **Razorpay Key ID** (starts with `rzp_test_` or `rzp_live_`), **NOT** the Key Secret. The Key Secret must only be used server-side.

---

## Environment File Examples

### server/.env (full example)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.abcde.mongodb.net/devflow?retryWrites=true&w=majority
JWT_SECRET=aV3ryL0ngAndS3cur3JWT%SecretKey#2024!
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
CLIENT_URLS=http://localhost:3000,https://devflow-ai-client.netlify.app

GROQ_API_KEY=gsk_your_groq_api_key_here
AI_MODEL=llama3-8b-8192

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=

OWNER_COUPON=YOUR_SECRET_COUPON
OWNER_COUPON_DURATION=30

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

### client/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## Security Warnings

1. **Never commit `.env` or `.env.local` to version control.** These files contain live credentials.
2. **Rotate all secrets** immediately if they have been exposed in version control history.
3. **Never expose `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, `CLOUDINARY_API_SECRET`, or `MONGO_URI`** to the client.
4. Use strong, randomly generated secrets for `JWT_SECRET` (min 32 characters, mixed case + numbers + symbols).
5. In production, set `NODE_ENV=production` to prevent stack traces from leaking in error responses.
