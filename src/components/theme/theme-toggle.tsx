"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useRef } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("chap-theme", theme);
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("chap-theme") as Theme | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return stored ?? (prefersDark ? "dark" : "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  if (!initialized.current && typeof window !== "undefined") {
    applyTheme(getInitialTheme());
    initialized.current = true;
  }

  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  return <>{children}</>;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="تغییر تم"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition hover:border-accent/40 hover:text-accent"
      >
        <Moon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="تغییر تم"
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition hover:border-accent/40 hover:text-accent"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
