# DsSync Hub - Installation Guide 🚀

This guide explains how to set up DsSync Hub on your local machine for development.

---

## 📌 Requirements

Install these first:

* Node.js (v18 or newer recommended)
* npm
* MongoDB Atlas account or local MongoDB
* Git
* Code Editor (VS Code recommended)

Check versions:

```bash
node -v
npm -v
```

---

## 📁 Project Structure

```text
DsSyncHub/
├── client/     Frontend React app
├── server/     Backend Node API
├── docs/       Documentation
├── screenshots/
└── README.md
```

---

## ⬇️ Clone Repository

```bash
git clone <your-repository-url>
cd DsSyncHub
```

Or open your existing local project folder.

---

## 📦 Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ../server
npm install
```

---

## ⚙️ Environment Setup

Create `.env` files in both frontend and backend folders.

---

## Backend Environment (`server/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GROQ_API_KEY=your_groq_api_key
```

Replace every placeholder with your real values.

---

## Frontend Environment (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=DsSync Hub
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

Replace every placeholder with your real values.

---

## ▶️ Run Backend

```bash
cd server
npm run sync:indexes
npm run dev
```

Expected:

```text
DsSync Hub API running on port 5000
```

---

## ▶️ Run Frontend

Open new terminal:

```bash
cd client
npm run dev
```

Expected:

```text
http://localhost:5173
```

---

## 🌐 Open App

Visit:

```text
http://localhost:5173
```

---

## ✅ Recommended First Test

1. Open signup page
2. Create account
3. Login
4. Open dashboard
5. Create task
6. Create note
7. Check billing page
8. Open settings

---

## 🔐 Google Login Setup

1. Open Google Cloud Console
2. Create OAuth Client ID
3. Add Authorized JavaScript Origin:

```text
http://localhost:5173
```

4. Copy Client ID into:

```env
GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
```

---

## 💳 Razorpay Setup

1. Open Razorpay Dashboard
2. Use Test Mode
3. Generate API Keys
4. Add keys:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
VITE_RAZORPAY_KEY_ID=
```

---

## 📧 Email Setup (Forgot Password)

Use Gmail App Password.

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

---

## 🛠 Common Errors

### MongoDB connection failed

* Check username/password
* Check IP whitelist in Atlas
* Check connection string

### Google login failed

* Verify client ID in both env files
* Check localhost origin added in Google console

### Payment popup not opening

* Verify Razorpay frontend key

### CORS error

* Check CLIENT_URL matches frontend URL

---

## 🧪 Build for Production

### Frontend

```bash
cd client
npm run build
```

### Backend

Deploy `server/` to Render / Railway.

---

## 🚀 Recommended Deployment Stack

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

## 📌 Notes

* Never commit `.env` files.
* Use strong JWT secret.
* Use production frontend URL after deployment.
* Use HTTPS in production.

---

## ✅ Installation Complete

Your DsSync Hub app should now be running locally.
