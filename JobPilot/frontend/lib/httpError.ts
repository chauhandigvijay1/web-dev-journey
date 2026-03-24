import axios from "axios";

function messageFromBody(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string" && data.trim()) {
    const t = data.trim();
    return t.length < 500 ? t : null;
  }
  if (typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.message === "string" && d.message.trim()) return d.message.trim();
  if (typeof d.error === "string" && d.error.trim()) return d.error.trim();
  const nested = d.error;
  if (nested && typeof nested === "object" && "message" in nested) {
    const m = (nested as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  return null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const fromBody = error.response?.data != null ? messageFromBody(error.response.data) : null;
  if (fromBody) return fromBody;

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Cannot reach the API. Start the backend and set NEXT_PUBLIC_API_URL (e.g. http://localhost:5051).";
  }
  if (error.code === "ECONNABORTED") {
    return "Request timed out. Try again.";
  }
  if (!error.response) {
    return "Cannot reach the API. Check that the server is running and the URL is correct.";
  }

  return fallback;
}
