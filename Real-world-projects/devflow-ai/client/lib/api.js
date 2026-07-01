import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

let redirectingToLogin = false;

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("devflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined" || redirectingToLogin) return Promise.reject(error);

    const status = error?.response?.status;
    const msg = error?.response?.data?.message?.toLowerCase() || "";

    const isAuthFailure =
      status === 401 ||
      msg.includes("jwt expired") ||
      msg.includes("invalid token") ||
      msg.includes("token expired") ||
      msg.includes("unauthorized") ||
      msg.includes("user not found");

    if (isAuthFailure) {
      redirectingToLogin = true;
      localStorage.removeItem("devflow_token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
