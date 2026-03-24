"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StoredUser } from "@/lib/authStorage";
import {
  getPasswordValidationMessage,
  getUsernameValidationMessage,
  isValidEmailAddress,
  normalizeUsernameInput,
} from "@/lib/auth-validation";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { login } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type AuthPayload = { token: string; user: StoredUser };

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const usernameMessage = useMemo(() => {
    if (!username) return "Pick a unique handle for sign-in and your profile.";
    return getUsernameValidationMessage(username) ?? "Looks good.";
  }, [username]);

  const passwordMessage = useMemo(() => {
    if (!password) return "Use 8+ characters with upper, lower, number, and symbol.";
    return getPasswordValidationMessage(password) ?? "Strong password.";
  }, [password]);

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

    const normalizedUsername = normalizeUsernameInput(username);
    const usernameError = getUsernameValidationMessage(normalizedUsername);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    if (!isValidEmailAddress(email)) {
      setError("Enter a valid email address.");
      return;
    }
    const passwordError = getPasswordValidationMessage(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setPending(true);
    try {
      const { data } = await api.post<{ success: boolean; data?: AuthPayload; message?: string }>(
        "/auth/register",
        {
          name: name.trim(),
          username: normalizedUsername,
          email: email.trim(),
          password,
          emailNotifications,
        }
      );
      if (!data.success || !data.data) {
        setError(data.message ?? "Could not create account");
        return;
      }
      await completeAuth(data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create account"));
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
        throw new Error(data.message ?? "Could not continue with Google");
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
      eyebrow="Get started"
      title="Create your account"
      description="Set up JobPilot with a clean profile, strong password, and a sign-in that works with email or username."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
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
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Your full name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="jobpilot-user"
              required
              value={username}
              onChange={(event) => setUsername(normalizeUsernameInput(event.target.value))}
            />
            <p className={`text-xs ${username && getUsernameValidationMessage(username) ? "text-destructive" : "text-muted-foreground"}`}>
              {usernameMessage}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            minLength={8}
            value={password}
            onChange={setPassword}
            description={passwordMessage}
            error={password && getPasswordValidationMessage(password) ? passwordMessage : null}
          />

          <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
            <Checkbox
              id="notify"
              checked={emailNotifications}
              onCheckedChange={(value) => setEmailNotifications(value === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="notify" className="cursor-pointer text-sm font-medium">
                Email reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Get follow-up reminders for jobs with scheduled dates.
              </p>
            </div>
          </div>

          <Button type="submit" className="h-11 w-full text-sm" disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
