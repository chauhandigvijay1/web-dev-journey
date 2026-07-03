<div align="center">
  <img alt="DsSync Hub" src="../client/public/logo_icon.svg" width="80" height="80">
  <h1>API Reference</h1>
  <p><strong>The official REST API and WebSocket documentation for DsSync Hub.</strong></p>
</div>

---

## 🌍 Base Configuration

**Base URL**: `https://dssync-hub-api.onrender.com/api`

### Standardized JSON Contracts
All REST API responses follow a strict, predictable JSON wrapper. 

**Success Response (2XX)**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response (4XX / 5XX)**
```json
{
  "success": false,
  "message": "Validation failed: 'email' is required"
}
```

### Authentication Mechanics
Most endpoints require authentication. The API supports two methods:
1. **Cookies**: `httpOnly` JWT cookies (automatically handled by the browser).
2. **Bearer Token**: Send the JWT in the `Authorization: Bearer <token>` header (useful for mobile apps or external integrations).

---

## 🛡️ Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/auth/register` | Register a new user | No |
| **`POST`** | `/auth/login` | Login via email/username/phone | No |
| **`POST`** | `/auth/google` | Login via Google OAuth credential | No |
| **`POST`** | `/auth/forgot-password` | Dispatch reset email | No |
| **`POST`** | `/auth/reset-password` | Consume reset token | No |
| **`GET`**  | `/auth/me` | Hydrate current user session | Yes |
| **`POST`** | `/auth/logout` | Invalidate current session | Yes |

*Example Payload for `/auth/register`:*
```json
{
  "fullName": "Jane Doe",
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

---

## 👤 Users (`/api/users`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **`GET`**  | `/users/me` | Get detailed user profile |
| **`PATCH`**| `/users/profile` | Update bio, timezone, or name |
| **`PATCH`**| `/users/security/password` | Change password (invalidates sessions) |
| **`PATCH`**| `/users/appearance` | Update UI theme preferences |
| **`POST`** | `/users/avatar` | Upload `multipart/form-data` image |
| **`GET`**  | `/users/avatar/:filename` | Stream avatar (Public, No Auth) |
| **`POST`** | `/users/logout-all` | Force increments `tokenVersion` |

---

## 🏢 Workspaces (`/api/workspaces`)

**Requirement**: All operations (except creation) require active Workspace Membership.

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| **`GET`**  | `/workspaces` | List all user workspaces | Any |
| **`POST`** | `/workspaces` | Create a new workspace | Any |
| **`GET`**  | `/workspaces/:id` | Get workspace details | Any |
| **`PATCH`**| `/workspaces/:id` | Update logo or settings | `admin+` |
| **`PATCH`**| `/workspaces/:id/archive` | Archive workspace | `owner` |
| **`POST`** | `/workspaces/:id/invite` | Dispatch email invite | `admin+` |
| **`PATCH`**| `/workspaces/:id/members/:memberId`| Change member role | `admin+` |
| **`DELETE`**| `/workspaces/:id/members/:memberId`| Kick member | `admin+` |

---

## ✅ Tasks (`/api/tasks`)

**Query Parameters**: `?workspace=<id>` (Required), `status`, `priority`, `assignee`.

| Method | Endpoint | Payload Example |
| :--- | :--- | :--- |
| **`GET`**  | `/tasks` | *None* |
| **`POST`** | `/tasks` | `{ "workspace": "id", "title": "Deploy API", "status": "todo" }` |
| **`PATCH`**| `/tasks/:id` | `{ "priority": "high", "dueDate": "2024-12-01" }` |
| **`PATCH`**| `/tasks/:id/status` | `{ "status": "done" }` |
| **`DELETE`**| `/tasks/:id` | *None* |

---

## 💬 Chat & Channels (`/api/chat` & `/api/channels`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **`GET`**  | `/channels?workspace=<id>` | List all channels |
| **`POST`** | `/channels` | Create a new channel |
| **`GET`**  | `/chat?workspace=<wId>&channel=<cId>`| Paginate messages |
| **`POST`** | `/chat/message` | Send message (Broadcasts via Socket) |
| **`PATCH`**| `/chat/message/:id` | Edit message |

---

## 🤖 AI Integration (`/api/ai`)

**Rate Limiting**: Enforced via workspace quotas. Connects to Groq LLM.

| Method | Endpoint | Payload Example |
| :--- | :--- | :--- |
| **`POST`** | `/ai/summarize` | `{ "workspace": "id", "text": "Long meeting notes..." }` |
| **`POST`** | `/ai/rewrite` | `{ "workspace": "id", "text": "Draft", "tone": "professional" }` |
| **`POST`** | `/ai/tasks` | `{ "workspace": "id", "prompt": "Break down deployment" }` |

---

## 💳 Billing (`/api/billing`)

Integrates with the Razorpay checkout SDK.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **`GET`**  | `/billing/current` | Get active subscription status |
| **`POST`** | `/billing/create-order`| Generate Razorpay Order ID |
| **`POST`** | `/billing/verify` | Verify HMAC signature and upgrade |
| **`POST`** | `/billing/cancel` | Downgrade to free tier |

---

## 🔌 WebSocket Engine

DsSync Hub utilizes `Socket.io` to achieve sub-50ms real-time synchronization.
**Connection**: `wss://dssync-hub-api.onrender.com` 
**Handshake**: Must provide JWT in the auth payload: `socket.connect({ auth: { token } })`.

### Bidirectional Event Dictionary

| Namespace | Event Name | Payload Example | Direction |
| :--- | :--- | :--- | :--- |
| **Chat** | `chat:message` | `{ workspace, channel, content }` | Client ↔ Server |
| **Chat** | `typing:start` | `{ workspace, channel, user }` | Client ↔ Server |
| **Task** | `task:created` | `{ ...taskObject }` | Server ➡️ Client |
| **Task** | `task:moved` | `{ taskId, status }` | Server ➡️ Client |
| **Note** | `note:updated` | `{ ...noteObject }` | Server ➡️ Client |
| **Calendar**| `calendar:deleted` | `{ eventId }` | Server ➡️ Client |

> [!TIP]
> Clients do not emit `task:created` via WebSockets. To prevent data races, the client issues a `POST /api/tasks` REST call. The Server updates MongoDB, and then the Server automatically emits the `task:created` Socket event to the workspace room.

---

<div align="center">
  <a href="database.md">← Previous: Database</a> | <a href="../README.md">🏠 Home</a>
</div>
