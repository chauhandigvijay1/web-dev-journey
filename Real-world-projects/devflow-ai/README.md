<p align="center">
  <img src="./docs/assets/logo.svg" alt="DevFlow AI" width="120" />
</p>

<p align="center">
  <strong>Your AI-Powered Development Assistant — Code smarter, ship faster.</strong>
</p>

<p align="center">
  DevFlow AI replaces scattered documentation and fragmented Google searches with a unified,
  AI-powered workspace to explain code, brainstorm architectures, and accelerate your development workflow.
</p>

<br/>

<p align="center">
  <a href="https://devflow-ai-client.netlify.app" target="_blank">
    <img src="https://img.shields.io/badge/LIVE_DEMO-→_Web_App-18181b?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo" />
  </a>
  <a href="./docs/README.md" target="_blank">
    <img src="https://img.shields.io/badge/DOCUMENTATION-→_Read_the_Docs-2563eb?style=for-the-badge&logo=gitbook&logoColor=white" alt="Documentation" />
  </a>
  <a href="https://github.com/chauhandigvijay1/web-dev-journey" target="_blank">
    <img src="https://img.shields.io/badge/SOURCE-→_GitHub-18181b?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://devflow-api-ubnd.onrender.com/api/health" target="_blank">
    <img src="https://img.shields.io/badge/API-→_Health_Check-22c55e?style=for-the-badge&logo=render&logoColor=white" alt="API Health" />
  </a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Tests-Jest_passing-brightgreen?style=flat-square&logo=jest" alt="Tests" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Framework-Next.js_16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/API-Express_5-green?style=flat-square&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/AI-Groq_Llama_3.1-orange?style=flat-square&logo=groq" alt="Groq" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-02042B?style=flat-square&logo=razorpay" alt="Razorpay" />
  <img src="https://img.shields.io/badge/SaaS_Readiness-9.0/10-blue?style=flat-square" alt="SaaS Readiness" />
</p>

<br/>

---

## 🎬 Motion Video Poster

<p align="center">
  <a href="https://player.cloudinary.com/embed/?cloud_name=dtdvtkzsm&public_id=Devflow-AI_ctbe8z" target="_blank">
    <img src="./docs/assets/gifs/demo-thumbnail.gif" alt="DevFlow AI Motion Video" width="720" style="border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
  </a>
  <br/>
  <em>Click above to watch the official DevFlow AI platform walkthrough.</em>
</p>

<br/>

<details>
<summary><strong>📑 Table of Contents</strong></summary>

- [Overview](#overview)
- [Feature Showcase (GIFs & UI)](#feature-showcase-gifs--ui)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Support](#support)

</details>

<br/>

---

## 🌍 Overview

### The Problem

Software engineers constantly context-switch between their IDEs, generic search engines, and multiple AI interfaces. Troubleshooting errors, understanding complex codebases, and drafting boilerplate often break focus. Furthermore, heavy AI models natively run too slowly, destroying the flow state required for deep work.

### The Solution

**DevFlow AI** is a premium, full-stack SaaS platform that brings ultra-fast, contextual AI assistance directly into a unified developer workspace. Powered by Groq's Llama 3.1 8B via Server-Sent Events (SSE), DevFlow AI delivers instantaneous, token-by-token streaming responses. With robust authentication, native billing tiers, and intelligent chat persistence, it acts as your ultimate pair-programming partner.

<br/>

---

## 🌟 Feature Showcase (GIFs & UI)

Rather than scattering images, explore the core modules of DevFlow AI below. **Interactive Workflows** are captured as GIFs, while **Static Interfaces** are presented as high-resolution screenshots.

### 🔄 Interactive Workflows

<details open>
  <summary><strong>1. Real-Time AI Chat Streaming</strong></summary>
  <p><em>Experience zero-latency, token-by-token generation powered by Groq and Server-Sent Events (SSE). Markdown is rendered in real-time with Prism syntax highlighting.</em></p>
  <p align="center">
    <img src="./docs/assets/gifs/ai-chat-streaming.gif" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="AI Chat Streaming" />
  </p>
</details>

<details>
  <summary><strong>2. Secure Checkout Flow</strong></summary>
  <p><em>Seamlessly upgrade to the Pro Tier via our Razorpay integration, featuring instant HMAC-SHA256 signature verification and coupon application.</em></p>
  <p align="center">
    <img src="./docs/assets/gifs/payment-checkout.gif" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Payment Checkout" />
  </p>
</details>

<details>
  <summary><strong>3. Adaptive Theming & UI</strong></summary>
  <p><em>Smoothly transition between light and dark modes with system preference detection and slick micro-animations.</em></p>
  <p align="center">
    <img src="./docs/assets/gifs/theme-toggle.gif" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Theme Toggle" />
  </p>
</details>

<br/>

### 🖥️ Core Interfaces

<details open>
  <summary><strong>1. Authentication Interface</strong></summary>
  <p><em>Secure, stateless JWT authentication with strict password policies and disposable email blocking.</em></p>
  <p align="center">
    <img src="./docs/assets/screenshots/login.png" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Login Page" />
  </p>
</details>

<details>
  <summary><strong>2. Billing Dashboard</strong></summary>
  <p><em>Monitor your AI usage limits (20 prompts/day vs. 999 prompts/day) and manage your Pro subscription status.</em></p>
  <p align="center">
    <img src="./docs/assets/screenshots/Billing.png" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Billing Dashboard" />
  </p>
</details>

<details>
  <summary><strong>3. Account Management</strong></summary>
  <p><em>Manage your profile avatar via direct Cloudinary uploads, update preferences, or execute soft account deletion.</em></p>
  <p align="center">
    <img src="./docs/assets/screenshots/Account.png" width="720" style="border-radius: 8px; border: 1px solid #e2e8f0;" alt="Account Settings" />
  </p>
</details>

<br/>

---

## 🏛️ Architecture

### System Overview

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Next.js 16 App<br/>Netlify (SSR + Static)"]
    end

    subgraph API["API Layer"]
        Express["Express 5 Server<br/>Port 5000"]
        Auth["Auth Service<br/>JWT + bcrypt + Resend"]
        ChatSvc["Chat Service<br/>CRUD + History Sync"]
        AISvc["AI Service<br/>Groq Llama 3.1 8B (SSE)"]
        PaySvc["Payment Service<br/>Razorpay + Webhooks"]
    end

    subgraph Storage["Storage Layer"]
        MongoDB["MongoDB Atlas<br/>Mongoose Schemas"]
        Cloudinary["Cloudinary<br/>Profile Image CDNs"]
    end

    subgraph External["External Services"]
        Groq["Groq API<br/>llama3-8b-8192"]
        Razorpay["Razorpay API<br/>Checkout & Billing"]
        Resend["Resend API<br/>Password Recovery Emails"]
    end

    Browser --> Express
    Express --> Auth
    Express --> ChatSvc
    Express --> AISvc
    Express --> PaySvc
    Auth --> MongoDB
    ChatSvc --> MongoDB
    PaySvc --> MongoDB
    AISvc --> Groq
    PaySvc --> Razorpay
    Auth --> Resend
    Browser --> Cloudinary

    style Client fill:#e1f5fe,stroke:#0288d1,color:#01579b
    style API fill:#e8f5e9,stroke:#388e3c,color:#1b5e20
    style Storage fill:#fff3e0,stroke:#f57c00,color:#e65100
    style External fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c
```

### AI Streaming Flow

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js Web App
    participant API as Express API
    participant Groq as Groq AI Cloud

    User->>Web: Submits Prompt
    Web->>API: POST /api/ai/prompt (Bearer)
    API->>API: Verify Auth & Daily Rate Limit
    API->>Groq: Request Stream Generation
    Groq-->>API: Stream Chunks
    API-->>Web: SSE data: {"token":" Hello"}
    Web-->>User: Markdown Renders Immediately
    API-->>Web: SSE data: [DONE]
```

<br/>

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Redux Toolkit, shadcn/ui | UI rendering, state management, robust streaming UX |
| **Backend** | Node.js, Express 5, Mongoose 8, JWT, bcryptjs | REST API, authentication, routing logic |
| **Database** | MongoDB Atlas | Persistent, highly-available cluster storage |
| **AI** | Groq Cloud API (Llama 3.1 8B) | Core AI chat engine and single-turn explanations |
| **Payments** | Razorpay | Subscription gateways, order creation, and signature validation |
| **Media** | Cloudinary | Scalable user profile avatar storage and optimization |
| **Email** | Resend | Dispatching secure password reset and recovery tokens |
| **Deployment** | Netlify (frontend), Render (backend) | Global CI/CD with robust environment variable injection |

<br/>

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Groq API key](https://console.groq.com)
- Razorpay test keys
- Cloudinary account
- Resend API key

### 1. Clone the Repository

```bash
git clone https://github.com/chauhandigvijay1/web-dev-journey.git
cd web-dev-journey/Real-world-projects/devflow-ai
```

### 2. Backend Setup

```bash
cd server
npm install
copy .env.example .env
```

### 3. Frontend Setup

```bash
cd ../client
npm install
copy .env.local.example .env.local
```

### 4. Run Locally

Run the backend and frontend concurrently in separate terminal instances:

```bash
# Terminal 1 (Backend - Port 5000)
cd server && npm run dev

# Terminal 2 (Frontend - Port 3000)
cd client && npm run dev
```

### 5. Verify Tests

```bash
# Backend unit tests via Jest
cd server && npm test

# Linting and formatting checks
npm run lint && npm run format
```

<br/>

---

## 🔐 Environment Variables

> **Note:** Never commit your `.env` files. Below are the required configurations; refer to the [Environment Documentation](./docs/environment.md) for deeper details.

### Backend (`server/.env`)

| Variable | Status | Description | Example Placeholder |
|----------|--------|-------------|---------------------|
| `MONGO_URI` | **Required** | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | **Required** | Access token secret | `your_secure_random_string` |
| `GROQ_API_KEY` | **Required** | Groq API key for AI | `gsk_your_api_key` |
| `RAZORPAY_KEY_ID`| **Required** | Razorpay testing/live ID | `rzp_test_xxxx` |
| `RESEND_API_KEY` | **Required** | Resend key for emails | `re_your_key` |

### Frontend (`client/.env.local`)

| Variable | Status | Description | Example Placeholder |
|----------|--------|-------------|---------------------|
| `NEXT_PUBLIC_API_URL`| **Required** | Backend API base URL | `http://localhost:5000` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`| **Required**| Razorpay Client ID | `rzp_test_xxxx` |

<br/>

---

## 📡 API Reference

All API routes are mounted under `/api` on the Express backend. Authentication is handled via the `Authorization: Bearer <token>` header. For exhaustive schemas, refer to the [API Documentation](./docs/api.md).

| Domain | Route | Method | Rate Limited | Description |
|--------|-------|--------|--------------|-------------|
| **Auth** | `/api/auth/login` | `POST` | Yes (20/15m) | Authenticate user & issue JWT |
| **Auth** | `/api/auth/reset-password` | `POST` | Yes | Consume recovery token |
| **Chat** | `/api/chats` | `GET` | No | Fetch all historical chat sessions |
| **AI** | `/api/ai/prompt` | `POST` | Yes (30/1m) | Generate SSE streaming AI response |
| **Pay** | `/api/payments/verify` | `POST` | No | Verify Razorpay HMAC signature |
| **Upload**| `/api/uploads/profile`| `POST` | No | Upload avatar to Cloudinary |

<br/>

---

## 🗄️ Database Schema

DevFlow AI relies on **MongoDB Atlas**. For exact indexing logic, see the [Database Docs](./docs/database.md).

1. **`users`**: Core identity, `bcrypt` password hashes, role tiers, and daily AI prompt counters.
2. **`chats`**: Top-level conversational entities with auto-generated contextual titles.
3. **`messages`**: Polymorphic embedded arrays handling user prompts and AI responses within chats.
4. **`subscriptions`**: Tracking active Razorpay subscription state and billing lifecycles.

<br/>

---

## 🧪 Testing

Quality Assurance is enforced via Jest. See [Testing Guidelines](./docs/testing.md).

| Layer | Tool | Coverage Focus |
|-------|------|----------------|
| **Backend Unit** | Jest | Route handlers, auth middleware, and payment signature validation. |
| **Static Analysis** | ESLint | Code quality, import standardization, and React hooks linting. |

<br/>

---

## 🚀 Deployment

- **Next.js Frontend**: Deployed seamlessly on **Netlify**.
- **Express Backend**: Deployed as a Node Web Service on **Render**.

*(Step-by-step instructions available in the [Deployment Guide](./docs/deployment.md))*

<br/>

---

## 🛡️ Security

Security is foundational. DevFlow AI enforces a Zero-Trust architecture. See [Security Policies](./docs/security.md).

- **Stateless Authorization**: JWT-based auth automatically expires in 7 days.
- **Disposable Blocklists**: Registration denies known disposable email domains to prevent free-tier abuse.
- **Payment Verification**: `HMAC_SHA256` strictly evaluates Razorpay signatures to prevent forged upgrades.
- **DDoS Mitigation**: Tiered rate limits capping `/api/ai/prompt` requests effectively.

<br/>

---

## ⚡ Performance

- **Zero Latency AI**: Groq Llama 3.1 combined with Server-Sent Events (SSE) completely eliminates standard HTTP request buffering delays.
- **Optimized Artifacts**: Profile images are natively compressed and auto-cropped to `512x512` by the Cloudinary API.
- **No-SQL Efficiency**: Chats are heavily indexed to return thousands of messages in under ~50ms.

<br/>

---

## 🛣️ Roadmap

### Implemented ✓
- [x] Streaming AI Chat with Groq Llama 3.1.
- [x] Robust JWT Authentication + Soft Deletion.
- [x] Razorpay Integration with Coupons.
- [x] Cloudinary Image Hosting.

### Planned ⏳
- [ ] Context-aware project file uploads for multi-file querying.
- [ ] GitHub OAuth Integration.
- [ ] Transitioning to double-submit CSRF protections.
- [ ] Usage Analytics Dashboard for Pro users.

<br/>

---

## ⚠️ Known Limitations

- AI capabilities rely strictly on Groq API and LLM uptime constraints.
- Cold-starts on Render's free tier may cause the initial authentication or chat request to pause for 5-10 seconds.
- Currently, AI context length is hard-capped per session to ensure lightning-fast token streaming.

<br/>

---

## 🤝 Contributing

We welcome world-class engineers to the project! Please review our comprehensive [Contributing Guidelines](./CONTRIBUTING.md) to understand our PR testing matrix requirements and our Code of Conduct.

<br/>

---

## 📄 License

DevFlow AI is open-source software licensed under the **[MIT License](./LICENSE)**.

---

## 🧑💻 Author

**Digvijay Kumar Singh**  
*Creator, Lead Architect, and Maintainer*  
- 🐙 [GitHub Profile](https://github.com/chauhandigvijay1)

---

## 📞 Support

If you encounter a replicable runtime error, please review the [Troubleshooting Guide](./docs/troubleshooting.md) or open an issue on our [GitHub Tracker](https://github.com/chauhandigvijay1/web-dev-journey/issues).

<div align="center">
  <em>Thank you for exploring DevFlow AI. If you find this project valuable, please consider giving it a ⭐ on GitHub!</em>
</div>
