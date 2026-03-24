"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ACCENT_STORAGE_KEY,
  THEME_STORAGE_KEY,
  applyAccentToDocument,
  applyThemeToDocument,
  defaultAccent,
  defaultTheme,
  persistAccent,
  persistTheme,
  readStoredAccent,
  readStoredTheme,
  themeAccentDefaults,
  type AccentId,
  type ThemeId,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeId;
  accent: AccentId;
  setTheme: (theme: ThemeId) => void;
  setAccent: (accent: AccentId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(defaultTheme);
  const [accent, setAccentState] = useState<AccentId>(defaultAccent);

  useEffect(() => {
    const storedTheme = readStoredTheme();
    const storedAccent = readStoredAccent();
    setThemeState(storedTheme);
    setAccentState(storedAccent);
    applyThemeToDocument(storedTheme);
    applyAccentToDocument(storedAccent);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        const nextTheme = readStoredTheme();
        setThemeState(nextTheme);
        applyThemeToDocument(nextTheme);
      }
      if (event.key === ACCENT_STORAGE_KEY) {
        const nextAccent = readStoredAccent();
        setAccentState(nextAccent);
        applyAccentToDocument(nextAccent);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      accent,
      setTheme(nextTheme) {
        const nextAccent = themeAccentDefaults[nextTheme] ?? defaultAccent;
        setThemeState(nextTheme);
        setAccentState(nextAccent);
        persistTheme(nextTheme);
        persistAccent(nextAccent);
        applyThemeToDocument(nextTheme);
        applyAccentToDocument(nextAccent);
      },
      setAccent(nextAccent) {
        setAccentState(nextAccent);
        persistAccent(nextAccent);
        applyAccentToDocument(nextAccent);
      },
    }),
    [accent, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
