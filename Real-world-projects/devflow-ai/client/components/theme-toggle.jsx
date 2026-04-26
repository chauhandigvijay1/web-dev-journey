"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" className="w-10 px-0 opacity-0">
        <Sun size={16} />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button variant="outline" className="w-10 px-0" onClick={toggleTheme}>
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
