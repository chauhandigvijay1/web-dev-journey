"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savePassword, setSavePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("devflow_token") || localStorage.getItem("token")
        : "";
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const usernameRule = /^[a-zA-Z0-9]{3,40}$/;
  const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const validate = () => {
    const nextErrors = {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let valid = true;

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
      valid = false;
    }
    if (!form.username.trim()) {
      nextErrors.username = "Username is required.";
      valid = false;
    } else if (!usernameRule.test(form.username.trim())) {
      nextErrors.username =
        "Use 3–40 characters, letters and numbers only (no special characters).";
      valid = false;
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
      valid = false;
    }
    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
      valid = false;
    } else if (!passwordRule.test(form.password)) {
      nextErrors.password =
        "At least 8 characters with one uppercase letter, one lowercase letter, and one digit (0–9).";
      valid = false;
    }
    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your password.";
      valid = false;
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      let authResponse;
      try {
        authResponse = await api.post("/api/auth/signup", {
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        });
      } catch (signupError) {
        // Fallback for environments that still expose only /register.
        if (signupError?.response?.status !== 404) throw signupError;
        authResponse = await api.post("/api/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        await api.put("/api/auth/update", { username: form.username });
      }
      if (savePassword) {
        localStorage.setItem("devflow_saved_email", form.email.trim().toLowerCase());
        localStorage.setItem("devflow_saved_username", form.username.trim().toLowerCase());
      } else {
        localStorage.removeItem("devflow_saved_email");
        localStorage.removeItem("devflow_saved_username");
      }
      localStorage.removeItem("devflow_token");
      localStorage.removeItem("token");
      router.push("/login?registered=1");
    } catch (err) {
      const data = err?.response?.data;
      let backendMsg = "";
      if (typeof data?.message === "string") backendMsg = data.message;
      else if (Array.isArray(data?.errors)) {
        backendMsg = data.errors.map((e) => e?.msg || e?.message).filter(Boolean).join(" ");
      }
      setError(backendMsg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 text-2xl font-semibold">Create your account</h1>
        <p className="mb-6 text-sm text-slate-500">Join DevFlow AI to start chatting.</p>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Username</label>
            <Input
              placeholder="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <p className="text-xs text-slate-500">
              3–40 characters, letters and numbers only (no spaces or special characters).
            </p>
            {fieldErrors.username && (
              <p className="text-xs text-red-500">{fieldErrors.username}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                placeholder="Create password"
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

          <div className="space-y-1">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                placeholder="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="pr-20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={savePassword}
                onChange={(event) => setSavePassword(event.target.checked)}
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="underline">
              Forgot password?
            </Link>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-900 underline dark:text-slate-100">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
