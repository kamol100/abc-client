"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  color: "zinc",
  density: "comfortable",
  radius: "0.5",
};

export const THEME_RADII: ThemeRadius[] = ["0", "0.3", "0.5", "0.75", "1.0"];

const ThemeSettingsContext = createContext<ThemeSettingsContextValue>(
  {} as ThemeSettingsContextValue
);

interface ThemeSettingsProviderProps {
  children: React.ReactNode;
  initialSettings?: Partial<ThemeSettings>;
}

export default function ThemeSettingsProvider({
  children,
  initialSettings,
}: ThemeSettingsProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings>({
    ...DEFAULT_THEME_SETTINGS,
    ...initialSettings,
  });
  const isInitialMount = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.themeColor = settings.color;
    root.dataset.density = settings.density;
    root.dataset.radius = settings.radius;
  }, [settings]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [settings]);

  const setColor = useCallback((color: ThemeColor) => {
    setSettings((prev) => ({ ...prev, color }));
  }, []);

  const setDensity = useCallback((density: ThemeDensity) => {
    setSettings((prev) => ({ ...prev, density }));
  }, []);

  const setRadius = useCallback((radius: ThemeRadius) => {
    setSettings((prev) => ({ ...prev, radius }));
  }, []);

  const contextValue = useMemo(
    () => ({ settings, setColor, setDensity, setRadius }),
    [settings, setColor, setDensity, setRadius]
  );

  return (
    <ThemeSettingsContext.Provider value={contextValue}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  return useContext(ThemeSettingsContext);
}
