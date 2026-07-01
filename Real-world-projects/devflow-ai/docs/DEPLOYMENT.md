# DevFlow AI — Deployment Guide

## Production URLs

| Component | URL |
|---|---|
| Frontend | `https://devflow-ai-client.netlify.app` |
| Backend API | `https://devflow-api-ubnd.onrender.com` |
| Health Check | `https://devflow-api-ubnd.onrender.com/api/health` |

---

## Prerequisites

- A **MongoDB Atlas** cluster (free tier works for development and low traffic)
- A **Groq Cloud** account with an API key
- A **Razorpay** merchant account (test mode for development)
- A **Cloudinary** account
- A **Netlify** account (for frontend)
- A **Render** account (for backend)

---

## Backend Deployment (Render)

### 1. Create a New Web Service

- **Provider:** Render
- **Type:** Node.js Web Service
- **Build Command:** `cd server && npm.cmd install`
- **Start Command:** `cd server && npm.cmd start`

### 2. Environment Variables

Configure the following in the Render dashboard:

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | `5000` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Strong random string (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Default: `7d` |
| `CLIENT_URL` | Yes | `https://devflow-ai-client.netlify.app` |
| `GROQ_API_KEY` | Yes | Groq Cloud API key |
| `AI_MODEL` | No | Default: `llama3-8b-8192` |
| `RAZORPAY_KEY_ID` | Yes | Razorpay test/live key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay test/live key secret |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `OWNER_COUPON` | No | Secret coupon code for 100% discount |
| `OWNER_COUPON_DURATION` | No | Days for owner coupon (default: 30) |
| `RESEND_API_KEY` | No | Resend API key for password reset emails (falls back to console log) |
| `EMAIL_FROM` | No | Sender address for password reset emails |

### 3. Important Notes

- **Free tier cold starts:** Render's free tier spins down after 15 minutes of inactivity. The first request after idle takes 5–10 seconds.
- **MongoDB IP Whitelist:** Add `0.0.0.0/0` to the MongoDB Atlas IP whitelist or restrict to Render's outbound IP range.
- **CORS:** Ensure `CLIENT_URL` exactly matches your Netlify URL (trailing slash is stripped automatically).

---

## Frontend Deployment (Netlify)

### 1. Connect Repository

Connect your GitHub repository to Netlify. The `netlify.toml` file is already configured:

```toml
[build]
  command = "npm.cmd run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 2. Environment Variables

Configure in the Netlify dashboard:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `https://devflow-api-ubnd.onrender.com` (or your Render URL) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Razorpay publishable key ID |

### 3. Build Settings

- **Base directory:** `client/`
- **Build command:** `npm.cmd run build`
- **Publish directory:** `.next`
- **Node version:** Set to **20** in Netlify's deploy settings (Dashboard → Site settings → Build & deploy → Environment → Node version)

### 4. Environment Variable Sync

Ensure the Netlify environment `NEXT_PUBLIC_RAZORPAY_KEY_ID` contains your **Razorpay Key ID** (NOT the Key Secret). The Key Secret must never be exposed to the client.

---

## Local Development

### Backend

```bash
cd server
copy .env.example .env
npm.cmd install
npm.cmd run dev            # starts on port 5000 with nodemon
```

### Frontend

```bash
cd client
copy .env.local.example .env.local
npm.cmd install
npm.cmd run dev            # starts on port 3000 with Next.js dev server (webpack)
```

### Required Local Environment

**server/.env:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/devflow?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GROQ_API_KEY=gsk_your_groq_key
AI_MODEL=llama3-8b-8192
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

**client/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## CI/CD

Netlify automatically deploys the `main` branch. Render requires manual configuration in the Render dashboard for auto-deploy from GitHub.

### Verifying a Deployment

1. Check the backend health endpoint: `GET /api/health`
2. Visit the frontend URL and confirm login/signup works
3. Test the Razorpay checkout flow in test mode
4. Verify that AI chat responses stream correctly

---

## Troubleshooting

### CORS Errors
- Confirm `CLIENT_URL` in the server env matches your Netlify URL exactly
- Check that no trailing slash issues exist (the server normalizes these)
- Verify the origin matches one of the configured URLs in `env.js`

### MongoDB Connection Failures
- Verify the IP whitelist in MongoDB Atlas includes `0.0.0.0/0` or Render's IP range
- Check that the connection string has the correct credentials and database name
- Ensure `retryWrites=true` is in the query string

### Razorpay Checkout Failures
- Confirm `NEXT_PUBLIC_RAZORPAY_KEY_ID` on Netlify is the **Key ID**, not the secret
- Verify that Razorpay test mode is enabled for test keys
- Check that the backend `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` match

### Build Failures
- Run `npm.cmd install` fresh (delete `node_modules` and `package-lock.json`)
- Verify Node.js version >= 18 (Next.js 16 requires Node 18+)
- Check that all environment variables are set in the deployment dashboard

### Render Cold Starts
- First request after idle will be slow (5–10s). This is normal for free tier.
- Consider upgrading to Render's paid tier for zero-downtime and no cold starts.
