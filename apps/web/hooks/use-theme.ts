"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return {
    theme: mounted ? theme : "dark",
    isDark: mounted ? theme === "dark" : true,
    toggle,
    setTheme,
    mounted,
  };
}
