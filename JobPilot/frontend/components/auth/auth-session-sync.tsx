"use client";

import { useEffect } from "react";
import { login, logout } from "@/store/authSlice";
import { readStoredAuth } from "@/lib/authStorage";
import { useAppDispatch } from "@/store/hooks";

export function AuthSessionSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function syncFromStorage() {
      const stored = readStoredAuth();
      if (stored.user && stored.token) {
        dispatch(login({ user: stored.user, token: stored.token }));
        return;
      }
      dispatch(logout());
    }

    window.addEventListener("jobpilot:auth-updated", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener("jobpilot:auth-updated", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [dispatch]);

  return null;
}
