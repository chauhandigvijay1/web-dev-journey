"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { ThemeProvider } from "next-themes";
import { store } from "@/store";
import { hydrateAuth } from "@/store/slices/authSlice";

function HydrationGate({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("devflow_token");
    if (token) {
      dispatch(hydrateAuth({ token }));
    }
  }, [dispatch]);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <HydrationGate />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
