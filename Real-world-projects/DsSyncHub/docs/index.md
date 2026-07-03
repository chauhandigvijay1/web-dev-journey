<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>DsSync Hub Documentation</h1>
  <p><strong>The complete technical manual for the open-source SaaS collaboration platform.</strong></p>
</div>

---

## Welcome to the Knowledge Base

DsSync Hub is a production-grade, multi-tenant collaboration engine engineered to unify task management, real-time chat, video conferencing, and AI assistance into a single workspace.

Built upon a highly scalable **MERN Monolith** (MongoDB, Express 5, React 19, Node 20), this platform features sub-50ms WebSocket synchronization, Groq LLM integrations, and a robust Razorpay billing pipeline.

Select a category below to explore the architecture, configure your environment, or learn how to contribute.

---

## 📚 Documentation Directory

### 🚀 Getting Started
Everything you need to configure, run, and deploy the application.
- **[Installation Guide](installation.md)**: Zero-to-running local development setup.
- **[Environment Configuration](environment.md)**: Secure management of `.env` variables and APIs.
- **[Deployment Manual](deployment.md)**: DevOps guide for Vercel, Render, and MongoDB Atlas.

### 🧠 Architecture & Core
Deep technical specifications of the codebase and data flow.
- **[System Architecture](architecture.md)**: Visual Mermaid diagrams of Auth, WebSockets, and Billing.
- **[API Reference](api.md)**: Standardized REST endpoints and Socket event dictionaries.
- **[Database Schema](database.md)**: Multi-tenant Entity-Relationships and O(1) indexing strategy.
- **[Backend Structure](backend.md)**: Express 5 routing, Bull queues, and Node.js services.
- **[Frontend Structure](frontend.md)**: React 19 UI, Vite compilation, and Redux Toolkit slices.

### 📖 Strategy & Case Study
The engineering story, roadmap, and performance metrics.
- **[Engineering Case Study](case-study.md)**: The "Why" behind our architectural trade-offs.
- **[Future Plans (Roadmap)](future-plans.md)**: Enterprise readiness, Next.js SSR, and upcoming AI Epics.
- **[Features Overview](features.md)**: Comprehensive breakdown of the SaaS capabilities.
- **[Performance & Scaling](performance.md)**: React memoization and database indexing metrics.
- **[Technical Challenges](challenges.md)**: How we solved data races and ephemeral storage constraints.
- **[Lessons Learned](lessons-learned.md)**: Key takeaways from building a production Socket singleton.

### 🛡️ Support & Community
Guidelines for maintaining, troubleshooting, and contributing to the ecosystem.
- **[Contributing Guide](contributing-guide.md)**: Git workflows, pathways, and strict Code Standards.
- **[Development Workflow](workflow.md)**: Branching, commits, and Pull Request lifecycles.
- **[Testing Strategy](testing.md)**: Vitest, Playwright, and `mongodb-memory-server` execution.
- **[Troubleshooting](troubleshooting.md)**: Diagnostic matrices for common local and production errors.
- **[FAQ](faq.md)**: Answers to common architectural and product questions.
- **[Security Policy](../SECURITY.md)**: Vulnerability reporting and defensive layer summary.

---

<div align="center">
  <a href="../README.md">🏠 Back to Repository Home</a>
</div>
