"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("devflow_token") || localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;
  return children;
}
