<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>Engineering Post-Mortems</h1>
  <p><strong>Key lessons learned from architecting and scaling DsSync Hub.</strong></p>
</div>

---

## Lesson 1: Real-Time Lifecycle Complexity

**The Problem**: 
Implementing Socket.io for immediate UI updates is incredibly powerful, but initially, it demanded strict lifecycle management. We attempted to connect and disconnect the socket on a per-component basis (e.g., instantiating it inside a React `useEffect` cleanup block). This led to catastrophic race conditions where transitioning between pages accidentally killed the socket connection for other active components.

**The Architecture Shift**: 
We migrated to a **Singleton Socket Architecture**. The socket is instantiated exactly once at the highest level of the application tree (typically at the Auth Provider level) and passed down via React Context.

**The Result**:
Zero dropped connections during page transitions, drastically reduced server handshake overhead, and highly predictable event listening.

---

## Lesson 2: State Synchronization Clashes

**The Problem**: 
Managing the same piece of data (like a Task's status) through both a REST API call and a WebSocket broadcast simultaneously resulted in duplicate UI states or race conditions if not handled perfectly on the client.

**The Architecture Shift**: 
We established a strict unidirectional data flow. Clients *never* emit raw socket events to update data. Instead, the client makes a standard REST HTTP call. The Express REST Controller handles validation and database updates, and *then* the server broadcasts the real-time event to all connected clients.

**The Result**:
Redux Toolkit cleanly merges the incoming server broadcast, ensuring the client UI remains perfectly synchronized with the true database state without optimistic UI clashing.

---

## Lesson 3: Monolithic vs Microservices

**The Problem**: 
As the feature set grew (AI processing, Email queues, Video Signaling), it was tempting to split these domains into dedicated microservices to isolate compute loads.

**The Architecture Shift**: 
We deliberately chose to stick to a structured, modular **Monolith** (`Express 5` + `Bull` on Redis). By organizing the codebase into strict domain modules rather than separate physical servers, we maintained code cohesion.

**The Result**:
We shipped features exponentially faster and significantly reduced the DevOps burden for open-source contributors, allowing them to spin up the entire ecosystem with a single `npm run dev` command.

---

## Lesson 4: Defending Against Third-Party Fragility

**The Problem**: 
Relying on external APIs (Groq for AI, Razorpay for Billing) introduced latency and points of failure entirely outside of our control. If Groq went down, our UI would hang indefinitely waiting for a response.

**The Architecture Shift**: 
We implemented the "Assume Failure" pattern for all third-party integrations. We wrapped API calls in aggressive timeouts (12 seconds max for AI), built automatic retries with exponential backoffs for webhooks, and implemented multi-key rotation to bypass unexpected rate limits.

**The Result**:
Graceful UI degradation. If an external service is unreachable, the application catches the timeout and alerts the user cleanly without freezing the browser or crashing the backend.

---

<div align="center">
  <a href="challenges.md">← Previous: Challenges</a> | <a href="../README.md">🏠 Home</a> | <a href="case-study.md">Next: Case Study →</a>
</div>
