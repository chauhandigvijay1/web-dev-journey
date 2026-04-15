"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/forgot-password", { email });
      setMessage(data?.message || "Reset instructions generated.");
      setResetToken(data?.data?.token || "");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 text-2xl font-semibold">Forgot password</h1>
        <p className="mb-6 text-sm text-slate-500">
          Enter your email to generate a password reset token.
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>}
          {resetToken && (
            <p className="rounded-md bg-slate-100 p-2 text-xs dark:bg-slate-800">
              Reset token: <span className="font-semibold">{resetToken}</span>
            </p>
          )}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Reset Token"}
          </Button>
        </form>

        <p className="mt-4 text-sm">
          Back to{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
