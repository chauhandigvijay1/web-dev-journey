import axios from "axios";
import {
  AUTH_TOKEN_KEY,
  clearStoredAuth,
  readStoredAuth,
  type StoredUser,
  writeStoredAuth,
} from "@/lib/authStorage";

const memoryStorage = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    memoryStorage.delete(key);
  }
}

function resolveApiBase(): string {
  const fallback =
    process.env.NODE_ENV === "production"
      ? "https://web-dev-journey-cnee.onrender.com"
      : "http://localhost:5051";
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
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { data } = await api.post<{ success: boolean; data?: { token: string; user?: StoredUser } }>(
        "/auth/refresh"
      );
      if (!data.success || !data.data?.token) {
        clearStoredAuth();
        return null;
      }

      const existing = readStoredAuth();
      const nextUser = data.data.user ?? existing.user;
      if (nextUser) {
        writeStoredAuth(data.data.token, nextUser);
      } else {
        safeSetItem(AUTH_TOKEN_KEY, data.data.token);
      }

      window.dispatchEvent(new Event("jobpilot:auth-updated"));
      return data.data.token;
    } catch {
      clearStoredAuth();
      return null;
    }
  })();

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = safeGetItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
    }
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
        requestUrl.includes("/auth/google") ||
        requestUrl.includes("/auth/refresh") ||
        requestUrl.includes("/auth/logout");

      const config = error.config as typeof error.config & { _retry?: boolean };

      if (!isAuthScreenRequest && config && !config._retry) {
        config._retry = true;
        return refreshAccessToken().then((token) => {
          if (!token) {
            clearStoredAuth();
            if (window.location.pathname.startsWith("/dashboard")) {
              window.location.replace("/login");
            }
            return Promise.reject(error);
          }

          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
          return api.request(config);
        });
      }

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
