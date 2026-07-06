<picture>
  <img src="./assets/logo.svg" alt="DevFlow AI Logo" width="48" height="48" align="left" style="margin-right: 16px;"/>
</picture>

# User Workflows

> Complete walkthrough of the primary user journeys — from account creation to AI chat to subscription management.

## Table of Contents

- [Overview](#overview)
- [1. User Onboarding](#1-user-onboarding)
- [2. AI Chat Session](#2-ai-chat-session)
- [3. Subscription Purchase](#3-subscription-purchase)
- [4. Account Management](#4-account-management)
- [5. Settings Configuration](#5-settings-configuration)
- [6. Profile & Avatar](#6-profile--avatar)
- [7. Password Reset](#7-password-reset)
- [8. Account Deletion](#8-account-deletion)
- [Best Practices](#best-practices)
- [Related Documents](#related-documents)
- [Next Reading](#next-reading)

---

## Overview

DevFlow AI supports eight primary user workflows. Each workflow involves multiple screens, API calls, and state transitions. The diagrams below illustrate the complete flow for each journey, providing developers with clear visibility into the system's lifecycle and error handling.

---

## 1. User Onboarding

The onboarding flow ensures a seamless transition from registration to the active dashboard.

### Flow: Signup → Login → Dashboard

```mermaid
sequenceDiagram
    actor User
    participant Signup as Signup Page
    participant API as Backend API
    participant DB as MongoDB
    participant Login as Login Page
    participant Dashboard as Dashboard

    User->>Signup: Fill name, username, email, password
    Signup->>API: POST /api/auth/signup
    API->>API: Validate input (password strength, disposable email)
    API->>DB: Check username/email uniqueness
    API->>DB: Create User (bcrypt hash)
    API->>DB: Create legacy Subscription
    API-->>Signup: { token, user }
    Signup->>Signup: Clear token, redirect to /login?registered=1
    User->>Login: Enter username/email + password
    Login->>API: POST /api/auth/login
    API->>DB: Find user by email or username
    API->>API: bcrypt.compare password
    API-->>Login: { token, user }
    Login->>Login: Store token in localStorage
    Login->>Dashboard: Redirect to /dashboard
    Dashboard->>API: GET /api/chats (fetch chats)
    Dashboard->>API: GET /api/auth/me (fetch profile)
    Dashboard-->>User: Empty dashboard with "New Chat" button
```

> [!NOTE]  
> **Key Decision Points:**
> - User can use either `register` (quick, no username) or `signup` (full) endpoint.
> - Client-side fallback: if `/signup` returns 404, it tries `/register` and then updates username via `/update`.
> - Token is NOT stored on signup — the user is redirected to login for first-time authentication.
> - "Remember me" persists the email/username to `localStorage` for pre-fill on the next visit.

---

## 2. AI Chat Session

The AI chat session outlines the creation of a chat instance and the streaming of AI responses.

### Flow: Create Chat → Send Prompt → Stream Response → View History

```mermaid
sequenceDiagram
    actor User
    participant Dashboard
    participant Chat as Chat Window
    participant API
    participant Groq as Groq Cloud
    participant DB

    User->>Dashboard: Clicks "New Chat"
    Dashboard->>API: POST /api/chats
    API->>DB: Create chat document
    API-->>Dashboard: { chatId }
    Dashboard->>Chat: Navigate to /chat/{chatId}
    Chat->>API: GET /api/chats/{chatId}
    API-->>Chat: { messages: [] } (empty chat)

    User->>Chat: Types prompt + Enter
    Chat->>Chat: Check free-tier limit client-side
    Chat->>API: POST /api/ai/prompt { chatId, prompt }
    API->>DB: Load chat (verify ownership)
    API->>DB: Load user (check plan, usage)
    API->>API: Auto-downgrade expired Pro, reset daily counter
    alt Free user at limit (20/day)
        API-->>Chat: 429 Daily limit
        Chat-->>User: "Upgrade to Pro" message
    else Limit not reached
        API->>DB: Save user message to chat
        API->>Groq: stream chat completion
        loop Each token
            Groq-->>API: Token
            API-->>Chat: SSE data: {"token":"..."}
            Chat->>Chat: Append to assistant message
        end
        API->>DB: Save assistant response, increment dailyCount
        API-->>Chat: data: [DONE]
        Chat->>API: GET /api/payments/status (refresh usage)
        Chat-->>User: Render Markdown + syntax highlighted code
    end
```

> [!WARNING]  
> **Error Recovery Paths:**
> - **Client disconnect:** Server aborts Groq stream, closes SSE connection.
> - **Groq API error mid-stream:** Server writes error token + `[DONE]` without invoking Express error handler.
> - **Network error:** Client shows "Error occurred" message and allows retry.
> - **Timeout (60s):** AbortController terminates stream, SSE connection closed.

---

## 3. Subscription Purchase

Handles the complete checkout flow, verifying payments securely via Razorpay.

### Flow: Pricing Page → Create Order → Razorpay Checkout → Verification → Pro Activated

```mermaid
sequenceDiagram
    actor User
    participant Billing as Billing Page
    participant API
    participant Razorpay
    participant DB

    User->>Billing: Opens /settings/billing
    Billing->>API: GET /api/payments/status
    API-->>Billing: { plan: "free", usage, pricing }

    User->>Billing: Clicks "Upgrade to Pro"
    Billing->>Billing: Optionally enter coupon code
    Billing->>API: POST /api/payments/create-order { couponCode? }
    API->>API: resolveCoupon(couponCode)
    alt Owner coupon (100% off)
        API->>API: Generate nonce (5-min expiry)
        API-->>Billing: { isFree: true, nonce, amount: 0 }
        Billing->>API: POST /api/payments/verify { nonce, orderId: "free_checkout" }
    else Paid
        API->>Razorpay: Create order
        Razorpay-->>API: { order_id, amount }
        API-->>Billing: { orderId, amount, keyId }
        Billing->>Billing: Load Razorpay SDK, open checkout modal
        User->>Razorpay: Complete payment (UPI, card, netbanking)
        Razorpay-->>Billing: { payment_id, signature }
        Billing->>API: POST /api/payments/verify { order_id, payment_id, signature }
        API->>API: HMAC-SHA256 verification
    end
    alt Invalid signature/expired nonce
        API-->>Billing: 400 error
    else Verified
        API->>DB: Set user.subscription = { plan: "pro", status: "active", expiresAt }
        API-->>Billing: { success: true }
        Billing->>API: GET /api/payments/status (refresh)
        Billing-->>User: Show Pro badge, unlimited usage meter
    end
```

> [!IMPORTANT]  
> **Watchdog timer:** The billing page starts a 45-second watchdog when opening the Razorpay modal. If the modal fails to load within that window, the user is notified and the checkout is cancelled.

---

## 4. Account Management

Simple user profile updates and sync logic to keep the UI up-to-date.

### Flow: Profile Update → Settings Sync

```mermaid
sequenceDiagram
    actor User
    participant Account as Account Page
    participant API
    participant DB

    User->>Account: Navigate to /account
    Account->>API: GET /api/auth/me
    API-->>Account: { user data }

    User->>Account: Edit name, username, contact
    Account->>Account: Client-side validation
    Account->>API: PUT /api/auth/update { name?, username?, phone?, avatar? }
    API->>DB: Update user document
    API-->>Account: { updated user }
    Account-->>User: Changes reflected immediately
```

> [!NOTE]  
> **Field Mapping:**
> - Client sends `phone` → server maps to `contact` in DB
> - Client sends `profileImage` → server maps to `avatar` in DB
> - Username is lowercased and trimmed server-side
> - Duplicate username returns `409 Conflict`

---

## 5. Settings Configuration

Dual persistence strategy for fast offline access and server syncing.

### Flow: Load Settings → Modify → Sync to Server + localStorage

```mermaid
sequenceDiagram
    actor User
    participant Settings as Settings Page
    participant API
    participant DB

    User->>Settings: Navigate to /settings
    Settings->>API: GET /api/auth/settings
    API->>DB: Read user.settings
    API-->>Settings: { settings object }
    alt Server settings empty
        Settings->>Settings: Fall back to localStorage cache
    end

    User->>Settings: Modify preferences (nickname, region, theme, etc.)
    User->>Settings: Clicks "Save Personalization" or "Save Preferences"
    Settings->>Settings: Persist to localStorage
    Settings->>API: PUT /api/auth/settings { all settings }
    API->>DB: $set user.settings.* fields
    API-->>Settings: { success }
    Settings-->>User: "Saved" confirmation (1.2s toast)
```

> [!TIP]  
> **Available Settings Fields:**  
> `nickname`, `interests`, `region`, `language`, `country`, `timezone`, `startPage`, `emailUpdates`, `compactMode`  
> 
> *Settings are dual-persisted: `localStorage` for offline/instant access, and server for cross-device sync.*

---

## 6. Profile & Avatar

A robust client-side cropping and optimization pipeline before cloud upload.

### Flow: Upload → Crop → Compress → Cloudinary → Profile Updated

```mermaid
sequenceDiagram
    actor User
    participant Account as Account Page
    participant Cropper as AvatarCropper
    participant Lib as image-processing.js
    participant API
    participant Cloudinary

    User->>Account: Clicks avatar to upload
    Account->>Account: File input opens (image/* only)
    User->>Account: Selects image file
    Account->>Lib: readFileAsDataURL(file)
    Lib-->>Account: dataURL
    Account->>Cropper: Open crop modal with image
    User->>Cropper: Adjust crop area + zoom
    User->>Cropper: Click "Confirm Crop"
    Cropper->>Lib: getCroppedImageBlob(imageSrc, cropAreaPixels)
    Lib->>Lib: Draw cropped area on canvas
    Lib-->>Cropper: Blob (JPEG, 0.95 quality)
    Cropper->>Lib: compressImageBlob(blob, { maxWidth: 512, quality: 0.82 })
    Lib->>Lib: Scale to max 512px, re-compress
    Lib-->>Cropper: Final blob
    Cropper->>Account: Return final blob
    Account->>Account: Create FormData with blob
    Account->>API: POST /api/uploads/profile (multipart/form-data)
    API->>API: Validate MIME type (image/*)
    API->>Cloudinary: Upload stream (512x512 crop, auto quality)
    Cloudinary-->>API: { secure_url, public_id }
    API-->>Account: { url: "https://res.cloudinary.com/..." }
    Account->>API: PUT /api/auth/update { avatar: cloudinaryUrl }
    Account-->>User: New avatar displayed
```

---

## 7. Password Reset

A secure, token-based recovery process.

### Flow: Request Reset → Receive Email → Set New Password → Login

```mermaid
sequenceDiagram
    actor User
    participant Forgot as Forgot Password Page
    participant Reset as Reset Password Page
    participant API
    participant Resend
    participant DB

    User->>Forgot: Enter email
    Forgot->>API: POST /api/auth/forgot-password { email }
    API->>API: Generate crypto.randomBytes(32) → hex token
    API->>API: Hash token with SHA-256
    alt Resend API key configured
        API->>Resend: Send branded HTML email with reset link
        Resend-->>User: Email delivered
    else No Resend key
        API->>API: Log token to console
    end
    API->>DB: Store SHA-256 hash + 15-min expiry
    API-->>Forgot: { success: true, expiresInMinutes: 15 }

    User->>Reset: Click reset link with ?token=xxx
    Reset->>User: Type new password
    Reset->>API: POST /api/auth/reset-password { token, password }
    API->>DB: Find user by SHA-256 hash, check expiry
    alt Valid
        API->>DB: Update password, clear reset fields
        API-->>Reset: { success: true, message: "Password reset successful." }
        Reset->>Reset: Redirect to /login
    else Invalid or expired
        API-->>Reset: 400 error
        Reset-->>User: "Reset token is invalid or expired"
    end
```

> [!CAUTION]  
> **Security Guarantees:**
> - Raw reset token is **never** returned in the API response.
> - Token stored as SHA-256 hash (not plaintext) in the database.
> - 15-minute expiry on all tokens.
> - Single-use: token is cleared after a successful reset.
> - Email is sent **before** saving the token to DB — if the email fails, no orphaned token is left.

---

## 8. Account Deletion

Ensures referential integrity while gracefully removing user access.

### Flow: Settings → Delete Confirmation → Soft Delete → Redirect

```mermaid
sequenceDiagram
    actor User
    participant Settings as Settings Page
    participant API
    participant DB

    User->>Settings: Open "Danger Zone" in /settings
    User->>Settings: Click "Delete Account"
    Settings->>Settings: Show confirmation modal
    User->>Settings: Type "DELETE" to confirm
    Settings->>Settings: Validate input
    Settings->>API: DELETE /api/auth/me
    API->>DB: Set isDeleted: true, deletedAt: now
    API->>DB: Suffix email + username with _deleted_{timestamp}
    API-->>Settings: { success: true }
    Settings->>Settings: Clear localStorage token
    Settings->>Settings: Redirect to /login
```

> [!NOTE]  
> **What Happens to Data:**
> - User document remains in the database (soft delete).
> - Chat histories are preserved (referential integrity).
> - Email and username are freed for reuse via `_deleted_{timestamp}` suffix.
> - The JWT continues to be technically valid but the `protect` middleware now rejects the user.
> - Account can be recovered by an admin by toggling `isDeleted` back to `false`.

---

## Best Practices

To ensure system stability across these workflows, observe the following best practices:
- **Resilience**: Always assume network interrupts and implement appropriate timeout catches (e.g., the 60s stream timeout and 45s Razorpay watchdog).
- **Consistency**: Centralize user state mapping on the backend (e.g., mapping `phone` to `contact`) to maintain a unified data shape.
- **Security**: Never expose cryptographic primitives (like the reset token) in plaintext; rely heavily on short-lived hashes.
- **Optimization**: Perform image manipulations (crop, compress) strictly on the client before delegating stream uploads to Cloudinary to save server compute and bandwidth.

---

## Related Documents

- [Architecture Overview](./architecture.md) — System architecture and data flows.
- [Frontend Architecture](./frontend.md) — Component structure and state management.
- [API Reference](./api.md) — All API endpoints used in these workflows.
- [Authentication](./authentication.md) — Detailed auth flow with middleware code.

## Next Reading

> **Next:** [Roadmap](../ROADMAP.md) — Planned features and development priorities.

---

<p align="center">
  <small>© 2024 DevFlow AI. Built with Next.js, Express, MongoDB, and Groq AI.</small>
</p>
