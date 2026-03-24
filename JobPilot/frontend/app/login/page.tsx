"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StoredUser } from "@/lib/authStorage";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { login } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type AuthPayload = { token: string; user: StoredUser };

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, router]);

  async function completeAuth(payload: AuthPayload) {
    dispatch(login(payload));
    router.replace("/dashboard");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { data } = await api.post<{ success: boolean; data?: AuthPayload; message?: string }>(
        "/auth/login",
        { identifier: identifier.trim(), password }
      );

      if (!data.success || !data.data) {
        setError(data.message ?? "Could not sign in");
        return;
      }

      await completeAuth(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not sign in"));
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setError(null);
    setPending(true);

    try {
      const { data } = await api.post<{ success: boolean; data?: AuthPayload; message?: string }>(
        "/auth/google",
        { credential }
      );

      if (!data.success || !data.data) {
        throw new Error(data.message ?? "Could not sign in with Google");
      }

      await completeAuth(data.data);
    } finally {
      setPending(false);
    }
  }

  if (!hydrated) {
    return <div className="flex min-h-dvh items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Use your email or username to pick up where you left off."
      footer={
        <p>
          New to JobPilot?{" "}
          <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        {error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <GoogleAuthButton
          disabled={pending}
          onCredential={handleGoogleCredential}
          onError={setError}
        />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card px-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Or
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or username</Label>
            <Input
              id="identifier"
              autoComplete="username"
              placeholder="you@example.com or jobpilot-user"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <Button type="submit" className="h-11 w-full text-sm" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
