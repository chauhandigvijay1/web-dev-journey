<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Installation Guide</h1>
  <p><strong>Step-by-step instructions for local development and environment configuration.</strong></p>
</div>

---

## Prerequisites

Before installing DsSync Hub, ensure your local development environment meets the following requirements:

- **Node.js**: `v18.x` or newer recommended
- **npm**: Package manager
- **Database**: A local MongoDB instance or a free MongoDB Atlas cluster
- **Git**: Installed and authenticated
- **Code Editor**: VS Code recommended

Check your versions:
```bash
node -v
npm -v
```

---

## 1. Clone the Repository

Begin by cloning the source code to your local machine and navigating into the directory:

```bash
git clone https://github.com/chauhandigvijay1/web-dev-journey.git
cd DsSyncHub
```

---

## 2. Install Dependencies

DsSync Hub utilizes a monorepo-style structure separating the React frontend and Express backend. You must install dependencies for both.

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd ../server
npm install
```

---

## 3. Core Environment Setup

DsSync Hub requires distinct environment variables for the frontend and backend.
Create a `.env` file in both the `/client` and `/server` directories. (Refer to [Environment Guide](environment.md) for the full list of variables).

### Third-Party Key Setup

To ensure the application functions fully on your local machine, you must configure the following external services:

#### Google Login Setup
1. Open the Google Cloud Console.
2. Create an OAuth Client ID.
3. Add `http://localhost:5173` to the **Authorized JavaScript Origins**.
4. Copy the Client ID into both `.env` files:
   - `GOOGLE_CLIENT_ID=` (server)
   - `VITE_GOOGLE_CLIENT_ID=` (client)

#### Razorpay Setup (Billing)
1. Open the Razorpay Dashboard and switch to **Test Mode**.
2. Generate API Keys.
3. Add the keys to your `.env` files:
   - `RAZORPAY_KEY_ID=` (server)
   - `RAZORPAY_KEY_SECRET=` (server)
   - `VITE_RAZORPAY_KEY_ID=` (client)

#### Email Setup (Forgot Password)
You must use a **Gmail App Password**, not your standard Gmail password.
1. Enable 2-Step Verification in your Google Account.
2. Generate an App Password.
3. Add to `server/.env`:
   - `EMAIL_USER=your_email@gmail.com`
   - `EMAIL_PASS=your_app_password`
   - `EMAIL_FROM=your_email@gmail.com`

---

## 4. Boot the Application

**Start the Backend:**
In your first terminal window, apply any new database indexes and start the Express server:
```bash
cd server
npm run sync:indexes
npm run dev
```
*Expected Output:* `DsSync Hub API running on port 5000`

**Start the Frontend:**
In a second terminal window, start the Vite development server:
```bash
cd client
npm run dev
```
*Expected Output:* `http://localhost:5173`

> [!WARNING]
> **Notes:** Never commit `.env` files. Ensure you use a strong, random string for your `JWT_SECRET`.

---

## 5. Build for Production

When you are ready to deploy, you must compile the React application and deploy the server.

**Compile Frontend:**
```bash
cd client
npm run build
```

**Recommended Deployment Stack:**
- **Frontend** ➡️ Vercel (Fast Edge CDN)
- **Backend** ➡️ Render / Railway (Node.js hosting)
- **Database** ➡️ MongoDB Atlas

---

## 6. Recommended First Test

To verify your installation is successful, perform the following smoke test sequence:

1. Open `http://localhost:5173`.
2. Open the signup page and create an account.
3. Login and open the dashboard.
4. Create a task and a note.
5. Check the billing page (ensure Razorpay loads).
6. Open settings.

---

<div align="center">
  <a href="../README.md">🏠 Home</a> | <a href="environment.md">Next: Environment Config →</a>
</div>
