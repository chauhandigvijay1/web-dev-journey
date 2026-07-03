<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Environment Configuration</h1>
  <p><strong>A comprehensive security and configuration guide for the backend and frontend environments.</strong></p>
</div>

---

## 🛡️ Security Protocol

**Rule #1: Never Commit Secrets**
Your `.env` files contain sensitive cryptographic keys and third-party credentials. They are explicitly ignored in `.gitignore`. 

**The `.env.example` Pattern**
For collaboration, we maintain `.env.example` files in both the client and server directories. These files document the *required keys* without exposing actual secrets. When setting up locally, you must copy the `.example` file to a new `.env` file and populate it with your own values.

> [!WARNING]
> **Client-Side Exposure**: Any variable in the `/client/.env` file prefixed with `VITE_` (e.g., `VITE_RAZORPAY_KEY_ID`) is statically compiled into the frontend JavaScript bundle and exposed to the user's browser. **Never put private secret keys in the client environment.**

---

## 🖥️ Server Environment (`server/.env`)

The Express backend strictly isolates sensitive credentials from the frontend.

### Core System
| Variable | Status | Default | Purpose | Example |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | `development` | Dictates logging verbosity and error stack visibility. | `production` |
| `PORT` | Optional | `5000` | The port the Express server binds to locally. | `5000` |
| `CLIENT_URL` | **Required** | None | Whitelisted CORS origin for the frontend to prevent cross-site request forgery. | `https://dssync-hub.vercel.app` |
| `LOG_LEVEL` | Optional | `info` | Minimum output level for the Pino logger (`debug`, `info`, `error`). | `info` |

### Database & Security
| Variable | Status | Default | Purpose | Example |
| :--- | :--- | :--- | :--- | :--- |
| `MONGO_URI` | **Required** | None | Connection string for MongoDB Atlas. | `mongodb+srv://...` |
| `JWT_SECRET` | **Required** | None | Cryptographic key used to sign and verify JSON Web Tokens. | `super_secret_key_123` |
| `JWT_EXPIRES_IN` | Optional | `7d` | Total lifespan of the issued authentication token. | `7d` |

### Integrations (Google, Razorpay, AI)
| Variable | Status | Default | Purpose | Example |
| :--- | :--- | :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` | Optional | None | OAuth 2.0 client ID for Google SSO validation. | `12345.apps.googleusercontent.com` |
| `GROQ_API_KEY` | Optional | None | Comma-separated API keys for the AI Assistant fallback rotation. | `gsk_123,gsk_456` |
| `RAZORPAY_KEY_ID` | Optional | None | Razorpay public billing key. | `rzp_test_123` |
| `RAZORPAY_KEY_SECRET` | Optional | None | Razorpay private secret (Required for Webhook HMAC validation). | `secret_123` |
| `BILLING_CURRENCY` | Optional | `INR` | Default currency for Razorpay checkouts. | `INR` |

### Cloud Storage (Cloudinary)
| Variable | Status | Default | Purpose | Example |
| :--- | :--- | :--- | :--- | :--- |
| `CLOUDINARY_CLOUD_NAME` | Optional | None | Cloudinary storage bucket name. | `dssync` |
| `CLOUDINARY_API_KEY` | Optional | None | Cloudinary API key for secure media uploads. | `123456789` |
| `CLOUDINARY_API_SECRET` | Optional | None | Cloudinary API private secret. | `secret_123` |

### SMTP Email Service
| Variable | Status | Default | Purpose | Example |
| :--- | :--- | :--- | :--- | :--- |
| `EMAIL_HOST` | Optional | `smtp.gmail.com` | SMTP provider host. | `smtp.resend.com` |
| `EMAIL_PORT` | Optional | `587` | SMTP port. | `465` |
| `EMAIL_USER` | Optional | None | SMTP authentication username (e.g., your Gmail). | `you@gmail.com` |
| `EMAIL_PASS` | Optional | None | SMTP authentication password (e.g., Gmail App Password). | `app_password_123` |
| `EMAIL_FROM` | Optional | None | The 'From' address displayed on outbound emails. | `noreply@dssync.app` |

---

## 📱 Client Environment (`client/.env`)

All variables in the client environment must be prefixed with `VITE_` to be readable by the React application.

| Variable | Status | Default | Purpose | Example |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **Required** | `http://localhost:5000/api` | Base URL for Axios REST requests pointing to the backend. | `https://api.dssync.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | Optional | None | Google OAuth Client ID (Must exactly match the Server's ID). | `12345.apps.googleusercontent.com` |
| `VITE_RAZORPAY_KEY_ID` | Optional | None | Razorpay public key for rendering the checkout modal. | `rzp_test_123` |
| `VITE_APP_NAME` | Optional | `DsSync Hub` | Default application title used in HTML document headers. | `DsSync Hub` |

---

<div align="center">
  <a href="api.md">← Previous: API</a> | <a href="../README.md">🏠 Home</a> | <a href="deployment.md">Next: Deployment →</a>
</div>
