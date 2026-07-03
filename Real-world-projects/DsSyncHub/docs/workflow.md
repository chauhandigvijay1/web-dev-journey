<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Development Workflow</h1>
  <p><strong>The standard operating procedure from local development to production deployment.</strong></p>
</div>

---

## Table of Contents
- [Quick Start (Local Setup)](#quick-start-local-setup)
- [Branching & PR Lifecycle](#branching--pr-lifecycle)
- [Database Management](#database-management)
- [Continuous Integration & Deployment (CI/CD)](#continuous-integration--deployment-cicd)
- [Related Documents](#related-documents)

---

## Quick Start (Local Setup)

To establish your local development environment quickly, follow these steps:

1. **Install Dependencies**: Ensure you are running Node.js 20+.
2. **Environment Configuration**: Duplicate the `.env.example` files in both the `/client` and `/server` directories into `.env` files. See the [Environment Guide](environment.md) for required keys.
3. **Boot the Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
4. **Boot the Frontend**:
   In a second terminal window:
   ```bash
   cd client
   npm install
   npm run dev
   ```

> [!TIP]
> Use `.env.local` for temporary local overrides (such as pointing `VITE_API_URL` to localhost or disabling secure cookies during testing).

---

## Branching & PR Lifecycle

DsSync Hub operates on a **Trunk-Based Development** model. The `main` branch is always deployable.

### 1. Branch Naming Conventions
To keep our repository organized, strictly adhere to these prefixes:
- `feature/` (e.g., `feature/socket-chat`)
- `bugfix/` (e.g., `bugfix/avatar-resolution`)
- `hotfix/` (e.g., `hotfix/stripe-webhook-crash`)

### 2. Docs-as-Code Requirement
We treat documentation with the exact same rigor as source code. 
- If your Pull Request introduces a new feature, you **must** update `docs/features.md`.
- If your Pull Request alters a route, you **must** update `docs/api.md`.
- PRs missing required documentation updates will be blocked during review.

### 3. Syncing with Main
Commit frequently to your short-lived feature branch. Before opening a Pull Request, you must rebase your branch against the latest `main` to ensure a linear, clean git history.

---

## Database Management

Because DsSync Hub is built on MongoDB (NoSQL) via Mongoose, there are no rigid "Up/Down" SQL migration files to run. The schema enforces structure dynamically.

**However**, if you modify a Mongoose schema to include new index definitions (such as adding a `unique: true` constraint to a field), you must manually sync the indexes locally:
```bash
npm run sync:indexes
```

---

## Continuous Integration & Deployment (CI/CD)

We employ a zero-touch, fully automated CI/CD pipeline to ensure quality and speed.

### Pre-Merge (GitHub Actions)
Every push to GitHub triggers our `.github/workflows/ci.yml` pipeline. This CI gateway:
1. Provisions an isolated Node.js environment.
2. Caches NPM modules to accelerate build times.
3. Executes the full suite of **92 backend tests** (`npm test`).
4. Executes the Vite production build (`npm run build`) to ensure frontend compilation succeeds.

> [!IMPORTANT]
> If any CI step fails, the Pull Request is mathematically blocked from merging. You must fix the pipeline locally and push the corrections.

### Post-Merge (Production Deployment)
Once a PR is approved and merged into `main`:
1. **Frontend**: Vercel detects the merge and automatically builds and deploys the React SPA to Edge CDNs.
2. **Backend**: Render detects the merge, pulls the latest code, and triggers a zero-downtime rolling restart of the Express API.

---

## Related Documents

- [Contributing Guide](contributing-guide.md)
- [Deployment Architecture](deployment.md)

---

<div align="center">
  <a href="contributing-guide.md">← Previous: Contributing</a> | <a href="../README.md">🏠 Home</a> | <a href="deployment.md">Next: Deployment →</a>
</div>
