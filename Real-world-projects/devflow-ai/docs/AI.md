# DevFlow AI — AI Integration

## Overview

DevFlow AI uses **Groq Cloud** for LLM inference. Groq provides ultra-low-latency inference through custom LPU (Language Processing Unit) hardware. The integration supports both streaming (chat) and non-streaming (code explanation) modes.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | — | Groq Cloud API key (required) |
| `AI_MODEL` | `llama3-8b-8192` | Model identifier for all completions |

The model is configured in `server/src/config/env.js` and defaults to Llama 3 8B if not specified. The actual model used in production may differ based on the environment's `AI_MODEL` variable.

## SDK

The project uses the official `groq-sdk` npm package (v0.21):

```javascript
const Groq = require("groq-sdk");
const client = new Groq({ apiKey: env.groqApiKey });
```

## Endpoints

### 1. Streaming Chat — `POST /api/ai/prompt`

**Purpose:** Send a user message in an existing chat and stream the AI response token-by-token.

**Protocol:** Server-Sent Events (SSE)

**System Prompt:** None defined in the code. The AI is given the full message history of the chat (user, assistant, and system messages) with no additional instruction. This means the model's default behavior applies.

**Request Flow:**
1. Load `Chat` document, verify ownership (`userId` match)
2. Load `User`, check subscription and usage limits
3. Auto-downgrade expired Pro subscriptions
4. Reset daily counter if UTC date changed
5. Free users with `dailyCount >= 20` receive `429` error
6. Push `{ role: "user", content: prompt }` to `chat.messages`
7. Auto-generate chat title from first prompt (truncated to 60 chars)
8. Call Groq streaming API with the full message history
9. Stream response via SSE with `data: {"token":"..."}\n\n` format
10. On completion, push `{ role: "assistant", content: fullResponse }` to `chat.messages`
11. Increment `user.usage.dailyCount`
12. Persist both documents
13. Send `data: [DONE]\n\n` and close the connection

**SSE Response Format:**

```
data: {"token":"Hello"}
data: {"token":"!"}
data: {"token":" How"}
data: {"token":" can"}
data: {"token":" I"}
data: {"token":" help"}
data: {"token":"?"}
data: [DONE]
```

**Error Handling During Stream:**
If the Groq stream throws an error after headers are sent:
- A fallback error message is written as a token
- `[DONE]` is sent
- The response is ended
- The error is never passed to Express's error middleware

**Usage Limits:**
| Plan | Daily Prompt Limit |
|---|---|
| Free | 20 |
| Pro | 999 (effectively unlimited) |

**Limit Reset:** The daily counter resets when the UTC date changes (`isSameUtcDate` comparison).

### 2. Code Explanation — `POST /api/ai/explain`

**Purpose:** Non-streaming, single-turn code explanation. No chat history is maintained.

**System Prompt:**

```
You are a senior developer who explains code simply.
```

**User Prompt Template:**

```
Explain this {language}:

{code}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "explanation": "This function..."
  }
}
```

**Limits:**
- `code`: max 50,000 characters
- `language`: max 50 characters (optional)

## Client-Side Rendering

The streaming response is consumed and rendered by the `ChatWindow` component:

1. **SSE Consumption:** The client uses `fetch()` with a manual reader to consume the SSE stream (no `EventSource` abstraction).
2. **Markdown Parsing:** The accumulated response is rendered with `react-markdown` (v10) using `remark-gfm` for GitHub-flavored Markdown.
3. **Syntax Highlighting:** Code blocks within the Markdown are rendered with `react-syntax-highlighter` (v16) using the `oneDark` theme from Prism.
4. **Copy-to-Clipboard:** Each message block includes a copy button for easy code extraction.

## Rate Limiting & Abuse Prevention

- **Global API-level:** 300 requests per 15 minutes per IP (Express rate-limiter)
- **Per-endpoint rate limiters:** Login/forgot-password: 20 requests per 15 minutes. AI endpoints: 30 requests per minute.
- **Usage-level:** 20 prompts per day for free users (application-level counter)
- **Payload limits:** Prompt max 8,000 characters, code max 50,000 characters
- **Validation:** All inputs validated via `express-validator` before reaching the Groq API
- **Streaming abort:** The AI controller uses `AbortController` with a 60-second timeout that starts after the Groq stream is received. The client can also abort in-flight requests on unmount, and the server aborts the stream when the client disconnects (`req.on("close")`).

## Future Considerations

- **Token counting:** Not currently implemented. Could be added for finer-grained billing.
- **Model selection:** Hardcoded to one model. Could be exposed as a user preference.
- **Conversation context window:** No explicit truncation — the full message history is sent every time. Long conversations may exceed the model's context window.
