# DsSync Hub - Testing Guide 🧪

This document explains how to test DsSync Hub during development and before deployment.

Testing should cover:

* Manual UI testing
* Backend API testing
* Authentication testing
* CRUD testing
* Payment testing
* Responsive testing
* Unit tests
* Integration tests
* Build verification

---

# 📌 Testing Strategy

Use 3 layers:

```text
1. Manual Testing
2. Automated Testing
3. Production Readiness Testing
```

---

# 1️⃣ Manual Testing

# 🌐 Public Pages

## Homepage

Check:

* Page loads fast
* Navbar works
* Buttons clickable
* Sections visible
* Responsive layout works

## Signup Page

Check:

* Form validation
* Create account works
* Duplicate email blocked
* Password validation works
* Google signup works

## Login Page

Check:

* Login with email
* Login with username
* Wrong password shows error
* Google login works
* Remember me works (if added)

## Forgot Password

Check:

* Email sent successfully
* Reset link works
* Password updates

---

# 🔐 Private Pages

Login first.

## Dashboard

Check:

* Stats load
* Sidebar navigation works
* Widgets visible

## Tasks

Check:

* Create task
* Edit task
* Delete task
* Change status
* Filter/search works

## Notes

Check:

* Create note
* Edit note
* Save note
* Delete note

## Chat

Check:

* Open chat page
* Send message UI works
* Layout responsive

## Billing

Check:

* Pricing cards visible
* Upgrade button clickable
* Razorpay popup opens

## Settings

Check:

* Update profile
* Change password
* Theme toggle

## Logout

Check:

* Session cleared
* Redirect works

---

# 2️⃣ Backend API Testing

Use:

* Postman
* Thunder Client
* Insomnia

---

# Auth APIs

Test:

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/me
```

Expected:

* Valid response shape
* Proper status codes
* Error handling works

---

# Task APIs

```http
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

---

# Notes APIs

```http
GET /api/notes
POST /api/notes
PUT /api/notes/:id
DELETE /api/notes/:id
```

---

# Billing APIs

```http
POST /api/billing/create-order
POST /api/billing/verify
GET /api/billing/status
```

---

# 3️⃣ Automated Testing

# Frontend Unit Tests

Recommended tools:

* Vitest
* React Testing Library

Test:

* Utility functions
* Redux reducers
* Components rendering
* Form validation logic

Run:

```bash
cd client
npm test
```

---

# Backend Tests

Recommended:

* Jest / Vitest
* Supertest

Test:

* Validators
  n- Auth routes
* Protected routes
* API responses

Run:

```bash
cd server
npm test
```

---

# 4️⃣ E2E Testing

Recommended:

* Playwright
  OR
* Cypress

Scenarios:

* Signup flow
* Login flow
* Create task
* Create note
* Logout flow

---

# 5️⃣ Responsive Testing

Check screen sizes:

* 375px mobile
* 768px tablet
* 1024px laptop
* 1440px desktop

Verify:

* No overflow
* Buttons visible
* Sidebar works
* Forms usable

---

# 6️⃣ Performance Testing

Check:

* Page load speed
* Large lists performance
* Search debounce
* No unnecessary rerenders
* Build size reasonable

Use:

* Chrome DevTools Lighthouse

---

# 7️⃣ Security Testing

Check:

* Protected routes blocked for guest users
* Invalid token rejected
* Duplicate account blocked
* Password not exposed
* Secrets not in frontend code
* Payment verification required

---

# 8️⃣ Build Testing

## Frontend

```bash
cd client
npm run build
```

Must complete successfully.

## Backend

```bash
cd server
npm start
```

Must run without crashes.

---

# 9️⃣ Final Pre-Deployment Checklist

* All env variables filled
* MongoDB connected
* Google auth works
* Forgot password works
* Payment works in test mode
* No major console errors
* README updated
* Screenshots added

---

# 🔧 Common Problems & Fixes

## Signup failing

Check backend running + MongoDB connected.

## Google login failing

Check Client ID in both env files.

## Billing popup not opening

Check Razorpay frontend key.

## API not reachable

Check VITE_API_URL.

---

# 📌 Suggested Test Order

```text
1. Signup
2. Login
3. Dashboard
4. Tasks
5. Notes
6. Billing
7. Settings
8. Logout
9. Mobile test
10. Build test
```

---

# 📈 Quality Goal

Before deployment, app should feel:

* Fast
* Stable
* Professional
* Responsive
* Error-free

---

# 📌 Summary

Testing DsSync Hub properly ensures a portfolio-grade production-quality project ready for interviews, demos, and deployment.
