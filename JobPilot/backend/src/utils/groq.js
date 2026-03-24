import axios from "axios";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function groqChat(messages, options = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key?.trim()) {
    const err = new Error("AI is not configured");
    err.statusCode = 503;
    throw err;
  }
  const model = options.model || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  let data;
  let status;
  try {
    const res = await axios.post(
      GROQ_URL,
      {
        model,
        messages,
        temperature: options.temperature ?? 0.35,
        max_tokens: options.max_tokens ?? 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        timeout: 90_000,
        validateStatus: () => true,
      }
    );
    data = res.data;
    status = res.status;
  } catch (e) {
    const err = new Error(e.message || "Groq request failed");
    err.statusCode = 502;
    throw err;
  }
  if (status >= 400) {
    const msg = data?.error?.message || `Groq error (${status})`;
    const err = new Error(msg);
    err.statusCode = 502;
    throw err;
  }
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    const err = new Error("Empty AI response");
    err.statusCode = 502;
    throw err;
  }
  return text;
}
