# DsSync Hub - Troubleshooting Guide 🛠️

This document helps solve common setup, runtime, authentication, payment, database, and deployment issues in DsSync Hub.

---

# 📌 Quick Debug Order

If something breaks, check in this order:

```text
1. Is backend running?
2. Is frontend running?
3. Are .env values correct?
4. Is MongoDB connected?
5. Is API URL correct?
6. Check browser console
7. Check server terminal logs
```

---

# 🌐 Frontend Issues

# App Not Opening

## Problem

Frontend page does not load.

## Fix

Run:

```bash
cd client
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# Blank White Screen

## Causes

* Build error
* Runtime JavaScript error
* Wrong imports

## Fix

Check browser console:

```text
F12 → Console
```

Then run:

```bash
npm run build
```

Fix TypeScript / import errors.

---

# CSS Not Loading

## Fix

Check:

* Tailwind installed
* main.css imported
* correct Vite config

---

# 🔌 Backend Issues

# Backend Not Starting

## Fix

Run:

```bash
cd server
npm install
npm run dev
```

Check terminal logs.

---

# Port Already In Use

## Problem

```text
EADDRINUSE: port 5000 already in use
```

## Fix

Kill old process or change:

```env
PORT=5001
```

---

# API 404 Errors

## Fix

Check frontend env:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🗄 MongoDB Issues

# MongoDB Connection Failed

## Causes

* Wrong URI
* Wrong password
* IP not whitelisted
* Internet issue

## Fix

Check:

```env
MONGO_URI=
```

MongoDB Atlas Network Access:

```text
0.0.0.0/0
```

---

# querySrv ECONNREFUSED Error

## Meaning

DNS / network issue reaching MongoDB Atlas.

## Fix

* Retry internet
* Use another network
* Use local MongoDB temporarily
* Check DNS/firewall

---

# Duplicate Key Error

## Example

```text
E11000 duplicate key error
```

## Fix

Already existing:

* email
* username
* phone

Use another value.

---

# 🔐 Authentication Issues

# Signup Failed

## Check:

* Backend running
* Mongo connected
* Email already exists
* Validation passed

---

# Login Failed

## Check:

* Correct password
* Correct identifier
* JWT secret exists

---

# Google Login Failed

## Fix

Check both files:

```env
GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
```

Google Cloud Console origins:

```text
http://localhost:5173
https://yourdomain.com
```

---

# Forgot Password Email Not Sending

## Fix

Check:

```env
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

Use Gmail App Password, not Gmail normal password.

---

# Invalid Reset Token

## Meaning

* Token expired
* Token already used
* Wrong token link

Request new reset link.

---

# 💳 Billing / Razorpay Issues

# Payment Popup Not Opening

## Fix

Check frontend env:

```env
VITE_RAZORPAY_KEY_ID=
```

---

# Payment Verification Failed

## Fix

Check backend env:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

# Pro Plan Button Not Working

## Fix

* Check browser console
* Verify billing route exists
* Check auth token present

---

# 📧 Email Issues

# Gmail Login Blocked

## Fix

Use Google App Password.

Enable:

* 2-Step Verification

Then generate App Password.

---

# 🧪 Build Issues

# Frontend Build Failed

Run:

```bash
cd client
npm run build
```

Fix:

* missing imports
* TypeScript errors
* wrong env usage

---

# Backend Crash in Production

## Fix

Check Render logs.

Verify:

* NODE_ENV=production
* MONGO_URI correct
* JWT_SECRET exists

---

# 🌐 Deployment Issues

# CORS Error

## Fix

Backend env:

```env
CLIENT_URL=https://yourfrontend.vercel.app
```

---

# Frontend Cannot Reach Backend

## Fix

Frontend env:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

# Google Login Works Local But Not Live

## Fix

Add production domain to Google OAuth origins.

---

# 📱 UI Issues

# Sidebar Broken on Mobile

## Fix

Check responsive classes and menu toggle.

---

# Buttons Not Clicking

## Fix

* Check loading overlay
* Check z-index issue
* Check disabled state bug

---

# 🔍 Debugging Tips

## Browser Debug

Use:

```text
F12 → Console → Network
```

## Backend Debug

Check terminal logs while clicking frontend buttons.

---

# 🚀 Emergency Reset Steps

If project becomes messy:

```bash
rm -rf node_modules
npm install
```

Frontend + backend both.

---

# 📌 Best Stability Checklist

* Backend running
* Frontend running
* Mongo connected
* Env values correct
* API URL correct
* Browser console clean
* Build passes

---

# 📌 Summary

Most DsSync Hub issues are caused by env values, MongoDB connection, wrong API URL, or missing third-party keys. Check those first.
