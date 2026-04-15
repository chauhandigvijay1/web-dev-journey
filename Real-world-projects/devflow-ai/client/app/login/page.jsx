"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { api } from "@/lib/api";
import { setCredentials } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ identifier: "", password: "" });

  useEffect(() => {
    const savedEmail = localStorage.getItem("devflow_saved_email") || "";
    const savedUsername = localStorage.getItem("devflow_saved_username") || "";
    const savedIdentifier = savedEmail || savedUsername;
    if (savedIdentifier) {
      setForm((prev) => ({
        ...prev,
        identifier: savedIdentifier,
      }));
      setRememberMe(true);
    }
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("devflow_token") || localStorage.getItem("token")
        : "";
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const registered = new URLSearchParams(window.location.search).get("registered");
    if (registered === "1") {
      setError(
        "Signup successful. Sign in with the same username or email and password you registered with."
      );
    }
  }, []);

  const validate = () => {
    const nextErrors = { identifier: "", password: "" };
    let valid = true;

    if (!form.identifier.trim()) {
      nextErrors.identifier = "Username or email is required.";
      valid = false;
    }
    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
      valid = false;
    }

    setFieldErrors(nextErrors);
    return valid;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", {
        identifier: form.identifier,
        password: form.password,
      });
      dispatch(setCredentials(res.data.data));
      if (rememberMe) {
        localStorage.setItem("token", res.data.data.token);
        const id = form.identifier.trim();
        if (id.includes("@")) {
          localStorage.setItem("devflow_saved_email", id.toLowerCase());
        } else {
          localStorage.setItem("devflow_saved_username", id.toLowerCase());
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("devflow_saved_email");
        localStorage.removeItem("devflow_saved_username");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-500">Login to continue to DevFlow AI.</p>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-sm font-medium">Username or Email</label>
            <Input
              placeholder="Enter username or email"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            />
            {fieldErrors.identifier && (
              <p className="text-xs text-red-500">{fieldErrors.identifier}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pr-20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="underline">
              Forgot password?
            </Link>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-slate-900 underline dark:text-slate-100">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}