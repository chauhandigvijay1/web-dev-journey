# DevFlow AI 🚀

DevFlow AI is a full-stack SaaS application that allows users to interact with an AI-powered chat system, manage usage limits, and upgrade plans through integrated billing.

The project is built using a modern MERN + Next.js stack and deployed on Netlify (frontend) and Render (backend).

---

## 🌐 Live Demo

* **Frontend (Netlify):** https://devflow-ai-client.netlify.app
* **Backend API (Render):** https://devflow-api-ubnd.onrender.com

---

## 📌 Features

### 🔐 Authentication

* User Signup & Login
* Secure password handling
* Forgot Password & Reset Password
* Unique username validation

### 💬 AI Chat System

* Create and manage chats
* Real-time message interaction
* Chat history persistence
* Clean UI with auto-scroll

### ⚡ Usage Limits

* Free plan with daily limits
* Usage tracking per user
* Limit enforcement on backend + UI

### 💳 Billing & Subscription

* Razorpay payment integration
* Upgrade to Pro plan
* Subscription status stored in database

### ⚙️ User Settings

* Profile management
* Account configuration
* Plan details

---

## 🛠️ Tech Stack

**Frontend:**

* Next.js
* React
* Tailwind CSS

**Backend:**

* Node.js
* Express.js
* MongoDB (Mongoose)

**Other Tools:**

* Razorpay (Payments)
* JWT (Authentication)
* Netlify (Frontend Hosting)
* Render (Backend Hosting)

---

## 📂 Project Structure

```
devflow-ai/
│
├── client/          # Frontend (Next.js)
├── server/          # Backend (Express + MongoDB)
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (.env)

Create a `.env` file inside the `server` folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=https://devflow-ai-client.netlify.app

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

### Frontend (.env.local)

Inside `client` folder:

```
NEXT_PUBLIC_API_URL=https://devflow-api-ubnd.onrender.com
```

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the Repository

```
git clone https://github.com/your-username/web-dev-journey.git
cd web-dev-journey/Real-world-projects/devflow-ai
```

---

### 2. Install Dependencies

#### Backend

```
cd server
npm install
```

#### Frontend

```
cd ../client
npm install
```

---

### 3. Run the Project

#### Start Backend

```
cd server
npm run dev
```

#### Start Frontend

```
cd client
npm run dev
```

---

### 4. Open in Browser

```
http://localhost:3000
```

---

## 🔧 Deployment

### Frontend (Netlify)

* Connected GitHub repository
* Auto-deploy on push
* Environment variable:

  * `NEXT_PUBLIC_API_URL`

### Backend (Render)

* Node.js Web Service
* Auto-deploy on push
* Environment variables configured in Render dashboard

---

## 🐛 Common Issues & Fixes

### CORS Errors

* Ensure `CLIENT_URL` is correctly set in backend `.env`
* Backend must allow Netlify domain

### 500 Server Errors

* Check MongoDB connection
* Verify environment variables
* Ensure schema matches database structure

### Deployment Fails

* Avoid using `*` wildcard in Express routes
* Always use:

  ```
  process.env.PORT || 5000
  ```

---

## 📈 Future Improvements

* Add real-time streaming responses
* Improve UI/UX animations
* Add admin dashboard
* Enhance analytics tracking

---

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

Developed by **Digvijay Kumar Singh**

---

## 🔗 Connect with Me

🧑‍💻 [LinkedIn](https://www.linkedin.com/in/digvijaykumarsingh)  
💻 [GitHub](https://github.com/chauhandigvijay1)  
📧 chauhandigvijay669@gmail.com

---

## ⭐ Support

If you like this repository or found it helpful, consider giving it a **star ⭐** on GitHub.
Your support motivates me to build more cool projects! 💡🔥

---

Stay tuned for updates! 🚀


