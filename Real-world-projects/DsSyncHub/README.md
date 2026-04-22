# DsSync Hub 🚀

![React](https://img.shields.io/badge/React-Frontend-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Fast_Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Modern_UI-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux-State_Management-764ABC?style=for-the-badge&logo=redux&logoColor=white)

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-REST_API-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_DB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Secure_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

![Google OAuth](https://img.shields.io/badge/Google-OAuth_Login-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Pro_Billing-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)
![Nodemailer](https://img.shields.io/badge/Nodemailer-Emails-30B980?style=for-the-badge&logo=gmail&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq-AI_Powered-FF6B00?style=for-the-badge)
![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

![Vercel](https://img.shields.io/badge/Vercel-Frontend_Live-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend_Live-5A67D8?style=for-the-badge&logo=render&logoColor=white)
![SaaS](https://img.shields.io/badge/SaaS-Production_Style-FF0080?style=for-the-badge)
![Workspace App](https://img.shields.io/badge/Workspace-Team_Collaboration-00C6FF?style=for-the-badge)
![Portfolio Ready](https://img.shields.io/badge/Portfolio-Ready-00C851?style=for-the-badge)

A production-style full-stack SaaS collaboration platform built for modern teams to manage tasks, notes, communication, billing, and workspace workflows in one place.

DsSync Hub demonstrates real-world MERN engineering with secure authentication, payment integration, scalable backend APIs, polished UI, and portfolio-ready product thinking.

---

## 🌐 Live Demo

* **Frontend:** [https://dssync-hub-client.vercel.app](https://dssync-hub-client.vercel.app)
* **Backend API:** [https://dssync-hub-api.onrender.com](https://dssync-hub-api.onrender.com)

---

## ✨ Key Features

### 🔐 Authentication

* Email / Username / Phone login
* Secure signup flow
* JWT authentication
* Google Sign In
* Forgot / Reset password

### 👥 Workspace System

* Create and manage workspaces
* Multi-workspace support
* Invite team members
* Role-ready architecture

### ✅ Task Management

* Create / edit / delete tasks
* Status workflows
* Priority levels
* Search and filtering

### 📝 Notes Module

* Create and manage notes
* Autosave-ready architecture
* Organized workspace notes

### 💬 Team Chat

* Team communication UI
* Channel-ready structure
* Real-time architecture ready

### 💳 Billing

* Free & Pro plans
* Razorpay checkout integration
* Subscription state handling

### ⚙️ Settings

* Profile updates
* Security settings
* Theme preferences

---

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Redux Toolkit
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT
* REST APIs

### Integrations

* Google OAuth
* Razorpay
* Nodemailer
* Groq AI API

---

## 📸 Screenshots

### 🏠 Homepage

![Homepage](screenshots/Homepage.png)

### 🔐 Login Page

![Login](screenshots/loginpage.png)

### 📝 Signup Page

![Signup](screenshots/signuppage.png)

### 📊 Dashboard

![Dashboard](screenshots/dashboard.png)

### ✅ Task Management

![Tasks](screenshots/Task.png)

### 🗒 Notes Module

![Notes](screenshots/Notes.png)

### 💬 Chat Page

![Chat](screenshots/chatpage.png)

### 💳 Billing Page

![Billing](screenshots/billingpage.png)

### ⚙️ Settings Page

![Settings](screenshots/settingspage.png)

### 🎥 Meeting Page

![Meeting](screenshots/meeting.png)

---

## 📁 Project Structure

```text
DsSyncHub/
├── client/          Frontend React application
├── server/          Backend Express API
├── screenshots/     UI screenshots
├── docs/            Project documentation
├── README.md
└── .gitignore
```

---

## ⚙️ Environment Variables

Before running the project, create `.env` files and replace all placeholder values with your own real credentials / API keys.


### Backend (`server/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_uri
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
GROQ_API_KEY=your_key
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=DsSync Hub
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_key
```

---

## 🚀 Run Locally

### 1️⃣ Install Dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2️⃣ Start Backend

```bash
cd server
npm run sync:indexes
npm run dev
```

### 3️⃣ Start Frontend

```bash
cd client
npm run dev
```

---

## 🧪 Testing Checklist

* Signup works
* Login works
* Google Sign In works
* Forgot password works
* Task CRUD works
* Notes CRUD works
* Billing works
* Logout works
* Responsive UI works

---

## 🚀 Deployment

### Frontend

Deploy on **Vercel**

### Backend

Deploy on **Render / Railway**

### Database

Use **MongoDB Atlas**

---

## 📈 Why This Project Matters

This project demonstrates:

* Full-stack MERN development
* Secure auth architecture
* REST API engineering
* Payment gateway integration
* State management
* Scalable folder structure
* Real product UI/UX thinking
* Deployment readiness

---

## 🔮 Future Improvements

* Real-time Socket chat
* File uploads
* Notifications center
* Calendar sync
* Analytics dashboard
* Admin controls
* AI productivity assistant

---

## 👨‍💻 Author

Digvijay Kumar Singh

---

## 🔗 Connect

LinkedIn: https://www.linkedin.com/in/digvijaykumarsingh
GitHub: https://github.com/chauhandigvijay1
Email: [chauhandigvijay669@gmail.com](mailto:chauhandigvijay669@gmail.com)

---

## ⭐ Support

If you found this project helpful, consider giving it a star ⭐

---
