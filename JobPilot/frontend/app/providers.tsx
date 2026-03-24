"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store/store";
import { hydrate } from "@/store/authSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  const dispatch = storeRef.current.dispatch;

  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);

  return (
    <Provider store={storeRef.current}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
}
