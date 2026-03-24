"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { StoredUser } from "@/lib/authStorage";
import { api } from "@/services/api";
import { logout, setUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AuthSessionSync() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !token) return;
    if (lastTokenRef.current === token) return;

    lastTokenRef.current = token;
    let cancelled = false;

    void api
      .get<{ success: boolean; data?: { user: StoredUser } }>("/auth/me")
      .then(({ data }) => {
        if (cancelled || !data.success || !data.data?.user) return;
        dispatch(setUser(data.data.user));
      })
      .catch(() => {
        if (cancelled) return;
        dispatch(logout());
        router.replace("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, hydrated, isAuthenticated, router, token]);

  return null;
}
