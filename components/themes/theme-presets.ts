import type { ThemePalette, ThemeRecordSettings } from "@/types/theme-types";

/**
 * Default and Jomuna use their preset colors from globals.css, so they have no palette.
 * These close copies let the builder preview them and turn them into a colorful theme
 * when the user changes a color.
 */
export const PRESET_PALETTES: Record<ThemeRecordSettings["preset"], ThemePalette> = {
  default: {
    primary: "#18181B",
    secondary: "#3B82F6",
    accent: "#52525B",
    sidebarFrom: "#FAFAFA",
    sidebarTo: "#F4F4F5",
    background: "white",
    charts: ["#E76E50", "#2A9D90", "#274754", "#E8C468", "#F4A462"],
    dark: {
      background: "#09090B",
      card: "#0F0F12",
      foreground: "#FAFAFA",
      muted: "#A1A1AA",
      border: "#27272A",
      primary: "#FAFAFA",
      secondary: "#60A5FA",
      accent: "#A1A1AA",
      sidebarFrom: "#18181B",
      sidebarTo: "#18181B",
    },
  },
  jomuna: {
    primary: "#0F766F",
    secondary: "#1D4ED8",
    accent: "#14B8A6",
    sidebarFrom: "#FFFFFF",
    sidebarTo: "#EEF4FB",
    background: "soft",
    charts: ["#0F766F", "#1D4ED8", "#F0B144", "#E11D48", "#64748B"],
    dark: {
      background: "#0E1619",
      card: "#121D21",
      foreground: "#E6F0F2",
      muted: "#8FA6AB",
      border: "#1E3036",
      primary: "#2DB3A8",
      secondary: "#5B8DEF",
      accent: "#2DD4BF",
      sidebarFrom: "#0E1619",
      sidebarTo: "#0E1619",
    },
  },
};

/** The colors a theme shows: its palette, or its preset's stand-in. */
export function displayPalette(settings: Pick<ThemeRecordSettings, "palette" | "preset">): ThemePalette {
  return settings.palette ?? PRESET_PALETTES[settings.preset];
}

/** Clickable colors in the builder. */
export const THEME_SWATCHES = [
  "#18181B", "#F0543C", "#DC2626", "#E63946", "#E11D74", "#DB2777", "#C026D3", "#7E22CE",
  "#7C3AED", "#4F46E5", "#2563EB", "#1D4ED8", "#0891B2", "#0F766F", "#0D9488", "#0E9F6E",
  "#16A34A", "#65A30D", "#D99A00", "#EA7A00", "#F5A300", "#EA580C",
] as const;
