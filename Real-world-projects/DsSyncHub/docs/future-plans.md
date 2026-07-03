<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Future Plans & Roadmap</h1>
  <p><strong>The strategic trajectory for scaling DsSync Hub into an enterprise-grade productivity engine.</strong></p>
</div>

---

## 🧭 The Strategic Vision

DsSync Hub has successfully established its v1.0 core: a highly scalable, multi-tenant collaboration platform powered by a strict MERN monolith and WebSockets. 

Our vision moving forward is guided by three strategic pillars:
1. **Enterprise Readiness**: Ensuring data sovereignty, strict compliance, and granular access controls for massive organizations.
2. **AI Augmentation**: Deepening our integration with the Groq LLM to actively reduce cognitive load for users, moving beyond simple chat into autonomous task management.
3. **Developer Experience (DX)**: Lowering the barrier to entry for open-source contributors through modernized tooling and containerization.

Rather than committing to rigid release dates, we utilize an Agile **Now, Next, Later** framework.

---

## 🚀 The "Next" Phase (Short-Term Horizons)

These are the immediate, high-priority Epics that we are actively seeking contributor support for.

### 1. Enterprise Security & Compliance
- **Audit Logging System**: Implement a tamper-proof `ActivityLog` tracking system. Workspace owners must be able to export a CSV detailing exactly *who* modified a task, *when* a channel was deleted, and *where* a user logged in from.
- **Granular RBAC**: Evolve beyond the static `owner/admin/member/viewer` hierarchy. Allow enterprises to create custom roles (e.g., "Billing Manager") and enforce strict IP-address whitelisting for workspace access.
- **Single Sign-On (SSO)**: Integrate SAML 2.0 and Enterprise OAuth gateways (Okta, Azure AD) alongside our existing Google OAuth implementation.

### 2. AI Productivity Suite (Groq LLM)
- **Generative Task Breakdowns**: Allow users to type a massive Epic (e.g., "Build the Billing Page") and have the Groq AI automatically generate and assign the 10 actionable sub-tasks required to complete it.
- **Instant Thread Summarization**: When a user returns to a highly active Chat Channel after the weekend, provide a 1-click "Catch me up" button that generates a contextual summary of the missed WebSocket events.

---

## 🔭 The "Later" Phase (Long-Term Architectural Shifts)

These represent massive systemic upgrades to our core infrastructure. They require deep architectural planning before execution.

### 1. The Next.js SSR Migration
While the Vite React SPA is incredibly fast for the dashboard, it harms the SEO of our public-facing landing and legal pages. We plan to migrate the unauthenticated marketing layer of the application to **Next.js**, utilizing Server-Side Rendering (SSR) to achieve perfect Lighthouse scores, while keeping the authenticated dashboard as a highly-optimized SPA.

### 2. Full Containerization
To eliminate "it works on my machine" issues for new open-source contributors, we will implement a robust **Docker Compose** network. This will allow developers to spin up the Node API, Vite frontend, and a local Redis/MongoDB instance with a single `docker-compose up` command.

### 3. Testing Infrastructure Overhaul
Currently, our backend testing suite relies on buffered Mongoose operations. We plan to migrate 100% of our integration tests to `mongodb-memory-server` to allow for rapid, isolated, and parallel test execution in CI/CD pipelines.

---

## 🤝 How to Contribute

DsSync Hub is built by the community, for the community. We actively encourage developers of all skill levels to claim these roadmap items!

If you see a feature above that you want to build:
1. Review our [Contributing Guide](contributing-guide.md) to understand our Git workflows and TypeScript/Express standards.
2. Open an **Issue** on GitHub describing how you plan to tackle the feature.
3. Mention that it is a Roadmap item, and a maintainer will assign it to you!

---

<div align="center">
  <a href="testing.md">← Previous: Testing</a> | <a href="../README.md">🏠 Home</a>
</div>
