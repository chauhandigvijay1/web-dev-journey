# DsSync Hub - Deployment Guide 🚀

This guide explains how to deploy DsSync Hub to production using a modern free/low-cost stack.

Recommended stack:

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

# 📌 Deployment Overview

```text
User Browser
   ↓
Frontend (Vercel)
   ↓ API Calls
Backend (Render)
   ↓
MongoDB Atlas
```

---

# ✅ Before Deployment Checklist

Ensure these work locally first:

* Signup
* Login
* Google Sign In
* Forgot password
* Tasks CRUD
* Notes CRUD
* Billing buttons
* Production build passes

Run:

```bash
cd client
npm run build
```

---

# 🌐 Step 1 - Deploy Frontend to Vercel

## 1. Push Project to GitHub

```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

## 2. Open Vercel

Create account and import GitHub repository.

## 3. Select Frontend Folder

Use:

```text
client/
```

## 4. Add Frontend Environment Variables

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=DsSync Hub
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## 5. Build Settings

```text
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

## 6. Deploy

After deployment you get:

```text
https://your-project.vercel.app
```

---

# ⚙️ Step 2 - Deploy Backend to Render

## 1. Open Render

Create new Web Service.

## 2. Connect GitHub Repo

Select same repository.

## 3. Root Directory

```text
server/
```

## 4. Build & Start Commands

```text
Build Command: npm install
Start Command: npm start
```

If using nodemon only for dev, use production start script.

## 5. Add Backend Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_uri
CLIENT_URL=https://your-project.vercel.app
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
GROQ_API_KEY=your_key
```

## 6. Deploy

After deployment:

```text
https://your-backend.onrender.com
```

---

# 🗄️ Step 3 - MongoDB Atlas Setup

## 1. Create Cluster

Use free cluster if needed.

## 2. Create Database User

Save username and password.

## 3. Network Access

Allow:

```text
0.0.0.0/0
```

(or restrict to hosting IPs later)

## 4. Get Connection String

```text
mongodb+srv://username:password@cluster.mongodb.net/dssync_hub
```

Use in:

```env
MONGO_URI=
```

---

# 🔐 Step 4 - Google OAuth Production Setup

Open Google Cloud Console.

Update Authorized JavaScript Origins:

```text
https://your-project.vercel.app
http://localhost:5173
```

Use same Client ID in frontend + backend env.

---

# 💳 Step 5 - Razorpay Production Setup

## Test Mode First

Use test keys until verified.

## Later Live Mode

Replace with live keys:

```text
rzp_live_xxxxx
```

Update both frontend and backend env.

---

# 📧 Step 6 - Email Delivery in Production

Recommended:

* Gmail App Password
* Resend
* Mailgun
* SendGrid

Ensure production sender email is valid.

---

# 🔁 Step 7 - Redeploy After Changes

Whenever env variables change:

* Redeploy frontend
* Redeploy backend

---

# 🧪 Final Production Testing Checklist

Test after deployment:

* Landing page loads
* Signup works
* Login works
* Google login works
* Forgot password email works
* Dashboard loads
* Tasks save
* Notes save
* Billing popup works
* Logout works
* Mobile responsive works

---

# 🛡 Security Recommendations

* Use strong JWT secret
* Restrict MongoDB IPs later
* Use HTTPS only
* Never expose backend secrets in frontend
* Rotate keys periodically

---

# 📈 Performance Tips

* Enable image compression
* Lazy load heavy pages
* Use CDN (Vercel already does)
* Add DB indexes
* Remove console logs in production

---

# 🔧 Common Deployment Errors

## Frontend cannot reach backend

Check:

```env
VITE_API_URL=
```

## CORS blocked

Check:

```env
CLIENT_URL=
```

## MongoDB failed

Check IP whitelist and URI password encoding.

## Google login failed

Check production domain in Google origins.

---

# 🌟 Recommended Final Stack

```text
Frontend  -> Vercel
Backend   -> Render
Database  -> MongoDB Atlas
Payments  -> Razorpay
Email     -> Gmail / Resend
AI        -> Groq
```

---

# 📌 Summary

DsSync Hub can be fully deployed as a production SaaS app using modern managed services with minimal cost.
