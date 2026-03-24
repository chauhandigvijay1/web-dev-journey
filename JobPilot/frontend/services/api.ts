import axios from "axios";
import { AUTH_TOKEN_KEY, clearStoredAuth } from "@/lib/authStorage";

function resolveApiBase(): string {
  const fallback = "http://localhost:5051";
  const raw = process.env.NEXT_PUBLIC_API_URL;
  let s =
    raw !== undefined && raw !== null && String(raw).trim() !== ""
      ? String(raw).trim()
      : fallback;
  s = s.replace(/\/+$/, "");
  if (!s) s = fallback.replace(/\/+$/, "");
  if (s.endsWith("/api")) return s;
  return `${s}/api`;
}

export const api = axios.create({
  baseURL: resolveApiBase(),
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      const requestUrl = error.config?.url ?? "";
      const isAuthScreenRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/google");

      if (!isAuthScreenRequest) {
        clearStoredAuth();
        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);
