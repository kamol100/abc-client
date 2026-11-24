"use client";

import { useFetch } from "@/app/actions";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import type { ThemeRecordSettings } from "@/types/theme-types";

/** A saved theme from GET /themes (isp-backend ThemeResource). */
export interface SavedTheme {
  id: string;
  key: string | null;
  name: string;
  is_system: boolean;
  is_mine: boolean;
  visibility: ThemeVisibility;
  owner_name: string | null;
  schema_version: number;
  settings: ThemeRecordSettings;
  updated_at: string | null;
}

export type ThemeVisibility = "private" | "shared";

export interface ThemeListPayload {
  themes: SavedTheme[];
  active_theme_id: string | null;
}

export interface SaveThemePayload {
  name: string;
  visibility: ThemeVisibility;
  settings: ThemeRecordSettings;
}

export const THEMES_QUERY_KEY = "themes";

export function useThemes(enabled = true) {
  return useApiQuery<ApiResponse<ThemeListPayload>>({
    queryKey: [THEMES_QUERY_KEY],
    url: "themes",
    pagination: false,
    enabled,
    staleTime: 60_000,
  });
}

/** Keeps only the keys the API accepts, in case a theme was saved by an older client. */
export function recordSettings(settings: ThemeRecordSettings): ThemeRecordSettings {
  const {
    color, density, radius, navDrawerSide, preset, gradients, gradientStyle, gradientAngle,
    font, fontSize, fontWeight, shadow, border, buttonRadius, cardRadius, dialogRadius, cardBorder, cardColors, palette,
  } = settings;
  return {
    color, density, radius, navDrawerSide, preset, gradients, gradientStyle, gradientAngle,
    font, fontSize, fontWeight: fontWeight ?? "regular", shadow, border, buttonRadius, cardRadius, dialogRadius,
    cardBorder: cardBorder ?? "off", cardColors: cardColors ?? "multi", palette: palette ?? null,
  };
}

export async function activateThemeRequest(id: string): Promise<SavedTheme> {
  const result = await useFetch({ url: `/themes/${id}/activate`, method: "POST" });
  if (!result?.success) throw result;
  return result.data as SavedTheme;
}
