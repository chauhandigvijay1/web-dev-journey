"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredUser } from "@/lib/authStorage";
import { api } from "@/services/api";
import { loginWithStorage } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { useAppSelector } from "@/store/hooks";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated) {
      setRestoring(false);
      return;
    }

    let cancelled = false;

    void api
      .post<{ success: boolean; data?: { token: string; user: StoredUser } }>("/auth/refresh")
      .then(({ data }) => {
        if (cancelled) return;
        if (data.success && data.data) {
          dispatch(loginWithStorage(data.data));
          return;
        }
        router.replace("/login");
      })
      .catch(() => {
        if (!cancelled) {
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRestoring(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, hydrated, isAuthenticated, router]);

  if (!hydrated || restoring) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-transparent text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
