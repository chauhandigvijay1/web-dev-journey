<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Production Deployment Guide</h1>
  <p><strong>A comprehensive DevOps manual for deploying the DsSync Hub ecosystem.</strong></p>
</div>

---

## 🏗️ Architectural Overview

DsSync Hub is engineered to be deployed globally with near-zero hosting costs by leveraging modern managed services.

**The Production Stack:**
- **Frontend (Vercel)**: Distributes the compiled React SPA across a global Edge CDN for instant load times.
- **Backend (Render)**: Provides a persistent Node.js runtime capable of maintaining long-lived Socket.io connections.
- **Database (MongoDB Atlas)**: A managed cloud database providing automated backups and secure clustering.
- **Third-Party Integrations**: Razorpay (Billing), Groq (AI), and Resend/Gmail (SMTP).

```text
       User Browser
            │
            ▼
    Frontend (Vercel)
            │
            ▼ (Axios API Calls & WebSockets)
            │
    Backend (Render)
            │
            ▼ (Mongoose Connection)
            │
      MongoDB Atlas
```

---

## 🚦 Pre-Flight Quality Gate

Before pushing code to production, you must verify the local build and critical user flows.

1. **Verify the React Build**: Run `cd client && npm run build` to ensure Vite compiles successfully without TypeScript errors.
2. **Smoke Test Flows**:
   - Create a new account via standard Signup.
   - Verify Google OAuth Sign In works.
   - Trigger the "Forgot Password" email flow.
   - Test CRUD operations for Tasks and Notes.
   - Click the Billing upgrade button to ensure the Razorpay modal mounts.

---

## 🚀 Step-by-Step Deployment

Follow these phases sequentially to ensure services can talk to each other.

### Phase 1: Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas.
2. Navigate to **Database Access** and create a User (Save the username/password).
3. Navigate to **Network Access** and temporarily add `0.0.0.0/0` to allow all IPs (You should restrict this to Render's static IPs later for maximum security).
4. Copy your Connection String (`mongodb+srv://username:password@cluster...`).

### Phase 2: Backend API (Render)
1. Ensure your code is pushed to a GitHub repository (`git push -u origin main`).
2. Open Render and create a new **Web Service**, connecting it to your GitHub repo.
3. **Configuration**:
   - Root Directory: `server/`
   - Build Command: `npm install`
   - Start Command: `npm start` (Ensure this runs `node index.js`, not `nodemon`).
4. **Environment Variables**: Input the following into Render's Environment panel:
   ```env
    PORT=5000
    NODE_ENV=production
    MONGO_URI=your_mongodb_uri
    CLIENT_URL=https://your-project.vercel.app
    JWT_SECRET=your_strong_random_secret
    JWT_EXPIRES_IN=7d
    GOOGLE_CLIENT_ID=your_google_client_id
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    EMAIL_FROM=your_email@gmail.com
    RAZORPAY_KEY_ID=your_key
    RAZORPAY_KEY_SECRET=your_secret
    GROQ_API_KEY=your_key
    SENTRY_DSN=your_sentry_dsn              # Optional — error tracking
    REDIS_URL=redis://default:pass@host:6379 # Optional — rate limiting & queue
    CLOUDINARY_URL=cloudinary://key:secret@name # Optional — cloud uploads
    COUPON_CODE=your_owner_coupon           # Optional — free Pro upgrades
    ```
5. Deploy the service and copy your generated Render URL (e.g., `https://your-backend.onrender.com`).

### Phase 3: Frontend SPA (Vercel)
1. Open Vercel and import the same GitHub repository.
2. **Configuration**:
   - Framework Preset: `Vite`
   - Root Directory: `client/`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_APP_NAME=DsSync Hub
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   ```
4. Deploy the frontend and copy your generated Vercel URL to update your Backend's `CLIENT_URL` if needed.

### Phase 4: Third-Party Webhooks
- **Google OAuth**: Open the Google Cloud Console and add your production Vercel URL (e.g., `https://your-project.vercel.app`) to the **Authorized JavaScript Origins**.
- **Razorpay**: Switch from Test Mode to Live Mode in the Razorpay dashboard. Generate new `rzp_live_xxxxx` keys and update both Vercel and Render environment variables.

---

## 🛠️ Troubleshooting Common Deploy Errors

| Symptom | Resolution |
| :--- | :--- |
| **Frontend Cannot Reach Backend** | Verify `VITE_API_URL` exactly matches your Render URL, including the `/api` suffix. |
| **CORS Blocked** | Verify the `CLIENT_URL` in Render's environment exactly matches your Vercel domain (no trailing slash). |
| **MongoDB Failed to Connect** | Check that `0.0.0.0/0` is whitelisted in Atlas, and ensure passwords with special characters in the `MONGO_URI` are properly URL-encoded. |
| **Google Login Fails in Prod** | You forgot to add the production Vercel domain to the Google OAuth Authorized Origins list. |

---

## 🛡️ Day-2 Operations (Security & Performance)

Once the application is live, implement these best practices:

- **Security**:
  - Restrict the MongoDB Network Access IP whitelist strictly to Render's outbound IP addresses.
  - Rotate your `JWT_SECRET` periodically.
  - Never expose backend secrets (like `RAZORPAY_KEY_SECRET`) in the Vercel frontend environment.
- **Performance**:
  - Remove all stray `console.log` statements in production to prevent memory leaks.
  - Ensure image compression (Cloudinary) is fully enabled to save bandwidth.

---

<div align="center">
  <a href="environment.md">← Previous: Environment</a> | <a href="../README.md">🏠 Home</a> | <a href="testing.md">Next: Testing →</a>
</div>
