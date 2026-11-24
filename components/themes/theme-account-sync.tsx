"use client";

import { useThemeSettings } from "@/context/theme-data-provider";
import { useEffect, useRef } from "react";
import { recordSettings, useThemes } from "@/components/themes/theme-api";
import { settingsFromTheme } from "@/lib/theme/theme-settings";
import type { ThemeRecordSettings } from "@/types/theme-types";

/** Compares settings regardless of key order (the cookie and the API may order keys differently). */
function signature(settings: ThemeRecordSettings): string {
  const sort = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sort);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, sort(item)]),
      );
    }
    return value;
  };
  return JSON.stringify(sort(recordSettings(settings)));
}

/**
 * Applies the theme saved on the staff account when this device shows another one
 * (new device, cleared cookies, or a change made on another device), or when that
 * theme's settings changed since this device took them (an owner edited it, or a
 * reseed added an option). The cookie keeps the first paint right; this only
 * corrects it after sign-in.
 */
export function ThemeAccountSync() {
  const { settings, applyTheme } = useThemeSettings();
  const { data } = useThemes();
  const payload = data?.data;
  // One apply per theme version, so a value the device cannot keep never loops.
  const applied = useRef<string | null>(null);

  useEffect(() => {
    const activeId = payload?.active_theme_id;
    if (!activeId) return;
    const theme = payload?.themes.find((item) => item.id === activeId);
    if (!theme) return;

    const next = settingsFromTheme(recordSettings(theme.settings), theme.id);
    const target = `${theme.id}:${signature(next)}`;
    if (activeId === settings.themeId && signature(settings) === signature(next)) return;
    if (applied.current === target) return;

    applied.current = target;
    applyTheme(recordSettings(theme.settings), theme.id);
  }, [payload, settings, applyTheme]);

  return null;
}
