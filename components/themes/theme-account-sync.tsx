"use client";

import { useThemeSettings } from "@/context/theme-data-provider";
import { useEffect } from "react";
import { recordSettings, useThemes } from "@/components/themes/theme-api";

/**
 * Applies the theme saved on the staff account when this device shows another one
 * (new device, cleared cookies, or a change made on another device). The cookie keeps
 * the first paint right; this only corrects it after sign-in.
 */
export function ThemeAccountSync() {
  const { settings, applyTheme } = useThemeSettings();
  const { data } = useThemes();
  const payload = data?.data;

  useEffect(() => {
    const activeId = payload?.active_theme_id;
    if (!activeId || activeId === settings.themeId) return;
    const theme = payload?.themes.find((item) => item.id === activeId);
    if (theme) applyTheme(recordSettings(theme.settings), theme.id);
  }, [payload, settings.themeId, applyTheme]);

  return null;
}
