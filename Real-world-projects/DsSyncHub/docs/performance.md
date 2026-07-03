<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Performance Optimizations</h1>
  <p><strong>Architectural strategies for high-speed rendering and low-latency data access.</strong></p>
</div>

---

## Client-Side Architecture

To ensure a rapid Time-to-Interactive (TTI) and buttery-smooth 60fps UI transitions, the frontend utilizes aggressive optimization patterns.

### Route Lazy Loading
The React Router configuration utilizes dynamic imports (`React.lazy`). The application code is split into manageable vendor and page-level chunks by Vite. This guarantees that heavy, complex components—like the `AdminPage` or the Jitsi `MeetingRoomPage`—are only fetched over the network when the user explicitly navigates to them, drastically reducing the initial bundle size.

### React Memoization
In high-frequency rendering contexts—specifically the `ChatPage` where real-time socket events cause continuous state updates—memoization is utilized to prevent catastrophic cascading re-renders:
- **`useMemo`**: Computed lists like `currentChannel`, `currentDirectUser`, `otherMembers`, and `mentionSuggestions` only recalculate when the underlying active channel ID or workspace membership changes.
- **`useCallback`**: Core socket event handlers (like sending messages or triggering typing indicators) maintain referential equality across renders to prevent child components from thrashing.

---

## Backend & Network Infrastructure

The Express API is designed to offload heavy processing and gracefully handle third-party latency.

### Redis Operational Caching
While raw application data is cached natively by MongoDB, **Redis** is explicitly utilized for heavy operational performance:
- **Rate Limiting**: `express-rate-limit` utilizes an `ioredis` store distributed across server instances. This absorbs brute-force attacks instantly without chewing up Node.js heap memory.
- **Background Jobs**: Bull queues offload heavy, blocking operations (like NodeMailer HTML template compilation and SMTP transmission) to Redis, immediately freeing the HTTP response cycle to return a `200 OK` to the user.

### Resilient AI Fallbacks
The Groq AI integration is optimized for resilience to ensure the assistant never stalls the client interface:
- **Multi-Key Fallback**: The AI service rotates through an array of API keys. If one hits a rate limit (429), the service seamlessly retries the next key with a 100ms exponential backoff.
- **Hard Timeout**: A strict 12-second timeout is enforced. If the LLM fails to stream a complete response in that window, the connection is safely aborted with a silent fallback.

---

## Database Level

### Compound & Text Indexing
MongoDB Atlas indexes are strictly enforced to accelerate tenant-based read queries:
- **Uniqueness**: The `email`, `username`, and workspace `slug` fields are indexed for immediate O(1) conflict resolution during creation.
- **Workspace Scoping**: Core resources have indexes applied to their `workspace` boundaries (e.g., `tasks.workspace`, `notes.workspace`) because every backend query includes a strict tenant filter.
- **Full-Text Search**: The Note model utilizes a text index combining the `title` and `plainText` fields to accelerate global workspace searches without triggering full collection scans.

### Pagination & Heap Protection
Endpoints serving lists (Search, Activity Logs, Notifications) implement strict `limit` caps (e.g., 100 items per request). This guarantees that a workspace with millions of logs cannot saturate the Express heap or the MongoDB connection pool in a single request.

---

<div align="center">
  <a href="troubleshooting.md">← Previous: Troubleshooting</a> | <a href="../README.md">🏠 Home</a> | <a href="testing.md">Next: Testing →</a>
</div>
