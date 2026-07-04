<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Frontend Architecture</h1>
  <p><strong>The technical blueprint for the React Single Page Application (SPA).</strong></p>
</div>

---

## 🚀 The Tech Stack

The frontend is engineered for maximum responsiveness, strict type safety, and rapid development iteration.

- **Core Framework**: React 19
- **Language**: TypeScript (Strict Mode)
- **Build Engine**: Vite (For HMR speed and optimized chunking)
- **State Management**: Redux Toolkit (RTK)
- **Routing**: React Router 7
- **Styling**: Tailwind CSS (Utility-first, heavily utilizing custom HSL color tokens)
- **Forms & Validation**: React Hook Form paired with Zod schemas
- **Iconography**: Lucide React

---

## 📂 Directory Structure

The `/client/src` directory is organized by technical domain rather than feature, ensuring clear boundaries for massive scale:

```text
client/src/
├── components/     # Reusable UI primitives (Avatars, Modals, Buttons)
├── hooks/          # Custom business logic (useTaskSocket, useChatSocket)
├── layouts/        # Structural wrappers (DashboardLayout, PublicLayout)
├── pages/          # 22 Top-level Route components
├── routes/         # Router configuration (AppRoutes, ProtectedRoute)
├── services/       # 17 API modules & Axios interceptors
├── store/          # Redux setup and 16 slice definitions
├── types/          # Global TypeScript interfaces
└── tests/          # Vitest and Playwright test suites
```

---

## 🧠 State Management (Redux Toolkit)

Global state is managed exclusively via **Redux Toolkit**. 

To prevent a massive, monolithic store, the state is divided into **16 distinct slices** corresponding to specific business domains (e.g., `authSlice`, `workspaceSlice`, `taskSlice`, `chatSlice`).

### Async Data Fetching
We do not use raw `useEffect` blocks for data fetching. All API communication routes through RTK's `createAsyncThunk`. 
This guarantees that `pending`, `fulfilled`, and `rejected` states are tracked automatically, drastically reducing boilerplate loading spinners across the UI.

---

## ⚡ Real-Time Socket Integration

To achieve zero-latency collaboration, DsSync Hub utilizes `socket.io-client`.

### The Singleton Pattern
The socket is instantiated as a strict **Singleton**. It is connected exactly once when the application boots (or upon successful authentication). 

> [!WARNING]
> **CRITICAL RULE**: Never call `socket.disconnect()` inside a component's cleanup function. The socket connection must remain alive across page transitions to ensure background notifications and chat updates are not dropped.

### Hook-Driven Event Listeners
We abstract socket listening into custom hooks (`useTaskSocket`, `useChatSocket`, `useNoteSocket`). When the server emits an event (like `task_updated`), the hook catches it and immediately dispatches a Redux action to update the store, instantly reflecting the change in the UI without requiring an HTTP refetch.

---

## 🧱 Production Hardening

- **Error Boundary**: `Sentry.ErrorBoundary` wraps the entire `<App>` tree with a custom `ErrorFallback` component that displays a user-friendly error and auto-redirects after 10 seconds.
- **localStorage Safety**: All `getItem`/`setItem` calls (5 locations) are wrapped in try/catch — prevents crashes in Safari Private Browsing or when storage is full.
- **Kanban Drag-and-Drop**: Task board uses `@dnd-kit/core` and `@dnd-kit/sortable` for native drag-and-drop between columns, replacing the previous Prev/Next button approach.

---

## 🛣️ Routing Architecture

React Router 7 handles declarative, client-side routing.

- **Route Guarding**: 
  - `ProtectedRoute`: Wraps the Dashboard. It checks the Redux `auth` state; if the user lacks a valid JWT, they are redirected to `/login`.
  - `GuestRoute`: Wraps the Login/Signup pages. If an authenticated user tries to hit them, they are pushed back to `/dashboard`.
- **Code Splitting (Lazy Loading)**: Page components are dynamically imported using `React.lazy()`. Vite automatically splits these into separate network chunks, ensuring the initial bundle size remains tiny.

---

## 🎨 Styling System (Tailwind CSS)

The application completely bypasses standard browser UI defaults in favor of a premium, custom aesthetic.

- **Utility-First**: All styling is handled via Tailwind CSS utility classes.
- **Dark Mode**: We enforce strict Dark Mode support using Tailwind's `class` strategy.
- **Design Tokens**: The `tailwind.config.js` is heavily customized with bespoke HSL color tokens to guarantee a rich, modern SaaS look (e.g., glassmorphism panels, subtle gradients).

---

<div align="center">
  <a href="features.md">← Previous: Features</a> | <a href="../README.md">🏠 Home</a> | <a href="backend.md">Next: Backend Architecture →</a>
</div>
