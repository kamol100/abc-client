"use client";

import * as React from "react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  enableSystem?: boolean;
}

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const THEME_CLASS_NAMES = ["light", "dark"] as const;

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(
  theme: ThemeMode,
  enableSystem: boolean,
): "light" | "dark" {
  if (theme === "system" && enableSystem) {
    return getSystemTheme();
  }

  return theme === "dark" ? "dark" : "light";
}

function applyThemeClass(theme: "light" | "dark"): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove(...THEME_CLASS_NAMES);
  root.classList.add(theme);
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeMode>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    resolveTheme(defaultTheme, enableSystem),
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(storageKey) as ThemeMode | null;
    const initialTheme = storedTheme ?? defaultTheme;
    const initialResolvedTheme = resolveTheme(initialTheme, enableSystem);

    setThemeState(initialTheme);
    setResolvedTheme(initialResolvedTheme);
    applyThemeClass(initialResolvedTheme);
  }, [defaultTheme, enableSystem, storageKey]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (theme !== "system" || !enableSystem) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextTheme = mediaQuery.matches ? "dark" : "light";
      setResolvedTheme(nextTheme);
      applyThemeClass(nextTheme);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [enableSystem, theme]);

  const setTheme = React.useCallback(
    (nextTheme: ThemeMode) => {
      const nextResolvedTheme = resolveTheme(nextTheme, enableSystem);
      setThemeState(nextTheme);
      setResolvedTheme(nextResolvedTheme);
      applyThemeClass(nextResolvedTheme);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, nextTheme);
      }
    },
    [enableSystem, storageKey],
  );

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
