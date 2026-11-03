"use client";

import {
  applyThemeAttributes,
  DEFAULT_THEME_SETTINGS,
  settingsWithPreset,
} from "@/lib/theme/theme-settings";
import type {
  ThemeBorder,
  ThemeColor,
  ThemeDensity,
  ThemeFont,
  ThemeFontSize,
  ThemeGradientAngle,
  ThemeGradientStyle,
  ThemeGradients,
  ThemeNavDrawerSide,
  ThemeOverrideKey,
  ThemeOverrides,
  ThemePreset,
  ThemeRadius,
  ThemeRadiusToken,
  ThemeSettings,
  ThemeSettingsContextValue,
  ThemeShadow,
} from "@/types/theme-types";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export { DEFAULT_THEME_SETTINGS };
export const THEME_RADII: ThemeRadius[] = ["0", "0.3", "0.5", "0.75", "1.0"];

const ThemeSettingsContext = createContext<ThemeSettingsContextValue>(
  {} as ThemeSettingsContextValue,
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
    overrides: initialSettings?.overrides ?? {},
  });
  const isInitialMount = useRef(true);

  useEffect(() => {
    applyThemeAttributes(document.documentElement, settings);
  }, [settings]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      void fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [settings]);

  const patch = useCallback((partial: Partial<ThemeSettings>) => {
    setSettings((current) => ({ ...current, ...partial }));
  }, []);

  const setColor = useCallback((color: ThemeColor) => patch({ color }), [patch]);
  const setDensity = useCallback((density: ThemeDensity) => patch({ density }), [patch]);
  const setRadius = useCallback((radius: ThemeRadius) => patch({ radius }), [patch]);
  const setNavDrawerSide = useCallback(
    (navDrawerSide: ThemeNavDrawerSide) => patch({ navDrawerSide }),
    [patch],
  );
  const setPreset = useCallback((preset: ThemePreset) => {
    setSettings((current) => settingsWithPreset(current, preset));
  }, []);
  const setGradients = useCallback((gradients: ThemeGradients) => patch({ gradients }), [patch]);
  const setGradientStyle = useCallback(
    (gradientStyle: ThemeGradientStyle) => patch({ gradientStyle }),
    [patch],
  );
  const setGradientAngle = useCallback(
    (gradientAngle: ThemeGradientAngle) => patch({ gradientAngle }),
    [patch],
  );
  const setFont = useCallback((font: ThemeFont) => patch({ font }), [patch]);
  const setFontSize = useCallback((fontSize: ThemeFontSize) => patch({ fontSize }), [patch]);
  const setShadow = useCallback((shadow: ThemeShadow) => patch({ shadow }), [patch]);
  const setBorder = useCallback((border: ThemeBorder) => patch({ border }), [patch]);
  const setButtonRadius = useCallback(
    (buttonRadius: ThemeRadiusToken) => patch({ buttonRadius }),
    [patch],
  );
  const setCardRadius = useCallback((cardRadius: ThemeRadiusToken) => patch({ cardRadius }), [patch]);
  const setDialogRadius = useCallback(
    (dialogRadius: ThemeRadiusToken) => patch({ dialogRadius }),
    [patch],
  );
  const setOverride = useCallback((key: ThemeOverrideKey, value: string | null) => {
    setSettings((current) => {
      const overrides: ThemeOverrides = { ...current.overrides };
      if (value) {
        overrides[key] = value;
      } else {
        delete overrides[key];
      }
      return { ...current, overrides };
    });
  }, []);
  const clearOverrides = useCallback(() => patch({ overrides: {} }), [patch]);

  const contextValue = useMemo(
    () => ({
      settings,
      setColor,
      setDensity,
      setRadius,
      setNavDrawerSide,
      setPreset,
      setGradients,
      setGradientStyle,
      setGradientAngle,
      setFont,
      setFontSize,
      setShadow,
      setBorder,
      setButtonRadius,
      setCardRadius,
      setDialogRadius,
      setOverride,
      clearOverrides,
    }),
    [
      settings,
      setColor,
      setDensity,
      setRadius,
      setNavDrawerSide,
      setPreset,
      setGradients,
      setGradientStyle,
      setGradientAngle,
      setFont,
      setFontSize,
      setShadow,
      setBorder,
      setButtonRadius,
      setCardRadius,
      setDialogRadius,
      setOverride,
      clearOverrides,
    ],
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
