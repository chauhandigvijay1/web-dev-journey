<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Enterprise Triage & Troubleshooting</h1>
  <p><strong>A diagnostic matrix for resolving common UI, runtime, deployment, and connection errors.</strong></p>
</div>

---

## ⚡ Quick Debug Order

If something breaks, always check in this exact order before diving deeper:

1. Is the backend running?
2. Is the frontend running?
3. Are the `.env` values correct?
4. Is MongoDB connected?
5. Is the `VITE_API_URL` correct?
6. Check the browser console (F12).
7. Check the server terminal logs.

---

## 🖥️ UI & Frontend Errors

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **App Not Opening** | Dev server is down. | Run `cd client`, `npm install`, and `npm run dev`. Ensure you open `http://localhost:5173`. |
| **Blank White Screen** | Runtime JS error or bad imports. | Press F12 to open the Console. Fix any TypeScript/import errors. Run `npm run build` to verify the build passes. |
| **CSS Not Loading** | Tailwind misconfiguration. | Check that Tailwind is installed, `main.css` is imported, and the Vite config is correct. |
| **Buttons Not Clicking** | DOM overlay interference. | Inspect the element. Check for a stuck loading overlay, a z-index issue, or an accidental disabled state bug. |
| **Sidebar Broken on Mobile** | Responsive class collision. | Check Tailwind responsive classes (`md:`, `lg:`) and the menu toggle state. |

---

## 🗄️ Database & Connection Errors

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **MongoDB Connection Failed** | Bad credentials or IP block. | Check `MONGO_URI`. Go to MongoDB Atlas ➡️ Network Access ➡️ Add `0.0.0.0/0`. |
| `querySrv ECONNREFUSED` | Your machine cannot reach MongoDB Atlas DNS. | Check your firewall, use a different network, or temporarily switch to a local `mongodb://` URI. |
| `E11000 duplicate key error` | Attempting to register an email, username, or phone that already exists. | Use a unique value. Mongoose enforces strict uniqueness at the schema level. |

---

## 🔒 Authentication Errors

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Signup / Login Failed** | Backend crash or bad credentials. | Verify the backend is running and MongoDB is connected. Ensure `JWT_SECRET` exists. |
| **Google Login Fails** | Origin mismatch or missing Client ID. | Ensure `http://localhost:5173` (or your prod URL) is added to "Authorized JavaScript Origins" in the Google Console. |
| **Reset Password Email Fails** | Gmail blocking standard password auth. | Ensure you are using a **Google App Password**, not your standard Gmail password, for `EMAIL_PASS`. |
| **"Invalid Reset Token"** | Token expired or mutated. | Tokens strictly expire after 60 minutes or if already used. Request a new reset link. |

---

## 💳 Payment & Billing Errors

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Payment Popup Won't Open** | Missing Frontend Key. | Ensure `VITE_RAZORPAY_KEY_ID` is set in the `client/.env` file. |
| **Payment Verification Fails** | Missing Backend Secrets. | Ensure `RAZORPAY_KEY_SECRET` is set in the `server/.env` file. |
| **Pro Plan Button Not Working** | Auth or Route failure. | Check browser console. Verify the billing route exists and the auth token is present. |

---

## 🌐 Deployment & Networking Errors

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Frontend Build Failed** | Strict TS/Linting errors. | Run `cd client && npm run build`. Fix missing imports, TypeScript errors, or wrong env usage. |
| **Backend Crash in Production** | Missing prod secrets. | Check Render logs. Verify `NODE_ENV=production`, `MONGO_URI` is correct, and `JWT_SECRET` exists. |
| **CORS Error** | Backend rejecting frontend origin. | Set `CLIENT_URL=https://yourfrontend.vercel.app` in your production backend environment variables. |
| **Frontend Can't Reach Backend** | Using localhost in production. | Ensure Vercel is configured with `VITE_API_URL=https://your-backend.onrender.com/api`. |
| **Google Login Works Local But Not Live** | Missing prod origin. | Add your production domain to the Google OAuth Authorized Origins. |
| **Port Already in Use** | Ghost Node process holding Port 5000. | Kill the existing process or temporarily change the backend `PORT=5001`. |

---

## 🆘 Emergency Reset Steps

If your local project dependency tree becomes incredibly messy or corrupted, execute a hard reset for both frontend and backend:

```bash
rm -rf node_modules
npm install
```

---

<div align="center">
  <a href="installation.md">← Previous: Installation</a> | <a href="../README.md">🏠 Home</a> | <a href="performance.md">Next: Performance →</a>
</div>
