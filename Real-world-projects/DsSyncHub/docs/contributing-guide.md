<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Contributing Guide</h1>
  <p><strong>A standardized onboarding manual for open-source contributors.</strong></p>
</div>

---

## Welcome to DsSync Hub!

Thank you for your interest in contributing. Whether you are fixing a typo in the documentation, submitting a bug fix, or proposing a massive new feature, your involvement is what makes the open-source community thrive.

To ensure a smooth, low-friction experience for everyone, please review the standardized pathways and code rules below before submitting your Pull Request (PR).

---

## 🗺️ Contribution Pathways

We categorize contributions to help you find tasks suited to your bandwidth:

- **Low-Barrier Tasks**: Perfect for first-time contributors. This includes fixing markdown typos, expanding documentation (the `docs/` folder), or adding unit tests.
- **Core Engineering**: Involves modifying the Express API, the React UI, or the MongoDB schemas. These require strict adherence to our Code Standards.

---

## 🚀 Getting Started Locally

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/web-dev-journey.git
   cd DsSyncHub
   ```
3. **Install Dependencies**:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
4. **Environment Setup**: Copy `.env.example` to `.env` in both folders and populate them (Refer to our [Environment Guide](environment.md)).

---

## 🌿 Git Branching Strategy

We enforce a strict branching taxonomy to keep the repository history clean.

- `main` represents the stable, deployable production environment. Never commit directly to `main`.
- Create short-lived feature branches originating from `main` using the following prefixes:
  - `feature/your-feature-name` (e.g., `feature/socket-chat`)
  - `bugfix/issue-description` (e.g., `bugfix/avatar-upload-crash`)
  - `docs/what-you-fixed` (e.g., `docs/update-readme`)

---

## 💻 Code Standards

If you are contributing code, your PR will be automatically rejected if it violates these structural rules:

### Backend (Node/Express)
- **Naming**: Strictly use `camelCase` for variables and function names.
- **Asynchrony**: Use `async/await` syntax exclusively. Do not use raw `.then().catch()` promise chains inside controllers.
- **Security**: Never console.log sensitive data.

### Frontend (React/Vite)
- **Architecture**: Strictly use **Functional Components** with hooks. Class components are not allowed.
- **Language**: All new frontend files must be written in **TypeScript** (`.ts` or `.tsx`). 
- **Styling**: Adhere strictly to the Tailwind CSS utility-first approach. Do not write custom CSS in `main.css` unless absolutely necessary.

---

## 📬 The Pull Request Process

When you are ready to merge your work, follow these steps:

1. **Test Locally**: Run `npm test` in both the `server` and `client` folders. Your PR will be blocked by GitHub Actions if tests fail.
2. **Rebase**: Ensure your branch is up-to-date with the upstream `main` branch to avoid merge conflicts.
3. **Open the PR**: Provide a clear, descriptive title. Detail exactly *what* you changed and *why* you changed it.
4. **Review**: A core maintainer will review your code. Please be responsive to requested changes!

---

<div align="center">
  <a href="faq.md">← Previous: FAQ</a> | <a href="../README.md">🏠 Home</a> | <a href="workflow.md">Next: Workflow →</a>
</div>
