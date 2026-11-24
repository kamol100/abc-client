import type { ThemePalette, ThemePaletteDark, ThemeSettings } from "@/types/theme-types";

/**
 * Turns a colorful theme's palette (a few hex picks) into the app's CSS variables
 * (`--primary`, `--sidebar-background`, `--chart-1` …, as HSL channels) for light and
 * dark. Used on the page root (layout + ThemeSettingsProvider) and, scoped, by the
 * theme builder preview.
 */

export const THEME_PALETTE_STYLE_ID = "theme-palette";

const HEX = /^#[0-9a-fA-F]{6}$/;

type Hsl = { h: number; s: number; l: number };
export type PaletteVariables = Record<string, string>;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

export function hexToHsl(hex: string): Hsl {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function channels(h: number, s: number, l: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const round = (v: number) => Math.round(v * 10) / 10;
  return `${round(((h % 360) + 360) % 360)} ${round(clamp(s))}% ${round(clamp(l))}%`;
}

function hexChannels(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return channels(h, s, l);
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const part = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * part((value >> 16) & 255) + 0.7152 * part((value >> 8) & 255) + 0.0722 * part(value & 255);
}

const TEXT_DARK = "240 10% 3.9%";
const TEXT_LIGHT = "0 0% 98%";

/** Readable text (dark or light) on a hex background. */
function textOn(hex: string): string {
  return luminance(hex) > 0.42 ? TEXT_DARK : TEXT_LIGHT;
}

function isDarkHex(hex: string): boolean {
  return luminance(hex) <= 0.42;
}

function lightenHex(hex: string, by: number, max = 72): string {
  const { h, s, l } = hexToHsl(hex);
  return channels(h, s, Math.min(l + by, max));
}

/** Sidebar text, hover and border colors that read on the sidebar gradient. */
function sidebarTokens(from: string, to: string): PaletteVariables {
  const a = hexToHsl(from);
  const b = hexToHsl(to);
  const dark = isDarkHex(from) && isDarkHex(to);
  const shift = dark ? 10 : -7;
  const foreground = dark ? "0 0% 98%" : channels(a.h, Math.min(a.s, 45), 14);

  return {
    "--sidebar-background": hexChannels(from),
    "--sidebar-from": hexChannels(from),
    "--sidebar-to": hexChannels(to),
    "--sidebar-foreground": foreground,
    "--sidebar-accent": channels(a.h, a.s, a.l + shift),
    "--sidebar-accent-foreground": foreground,
    "--sidebar-primary": foreground,
    "--sidebar-primary-foreground": hexChannels(from),
    "--sidebar-border": channels(a.h, a.s, a.l + shift * 1.3),
    "--sidebar-active-foreground": foreground,
    "--soft-1": channels(a.h, a.s, a.l + shift * 1.4),
    "--soft-2": channels(b.h, b.s, b.l + shift * 1.4),
  };
}

function chartTokens(charts: string[]): PaletteVariables {
  return Object.fromEntries(
    charts.slice(0, 5).map((color, index) => [`--chart-${index + 1}`, hexChannels(color)]),
  );
}

export function lightPaletteVariables(palette: ThemePalette): PaletteVariables {
  const p = hexToHsl(palette.primary);
  const s = hexToHsl(palette.secondary);
  const a = hexToHsl(palette.accent);
  const background = {
    white: channels(0, 0, 100),
    soft: channels(p.h, 40, 97.5),
    strong: channels(p.h, 70, 94.5),
  }[palette.background];
  const foreground = channels(p.h, 30, 12);
  const tinted = palette.background !== "white";

  return {
    "--background": background,
    "--foreground": foreground,
    "--card": channels(0, 0, 100),
    "--card-foreground": foreground,
    "--popover": channels(0, 0, 100),
    "--popover-foreground": foreground,
    "--primary": hexChannels(palette.primary),
    "--primary-foreground": textOn(palette.primary),
    "--ring": hexChannels(palette.primary),
    "--secondary": channels(s.h, Math.min(s.s, 70), 95),
    "--secondary-foreground": channels(s.h, s.s, 25),
    "--muted": channels(p.h, 25, 95.5),
    "--muted-foreground": channels(p.h, 12, 40),
    "--accent": channels(a.h, Math.min(a.s, 75), 93),
    "--accent-foreground": channels(a.h, a.s, 22),
    "--border": channels(p.h, tinted ? 35 : 8, 89),
    "--input": channels(p.h, tinted ? 30 : 8, 85),
    "--brand-secondary": hexChannels(palette.secondary),
    "--sidebar-ring": hexChannels(palette.primary),
    "--wash-1": tinted ? channels(p.h, 75, 94.5) : background,
    "--wash-2": background,
    "--wash-3": tinted ? channels(s.h, 60, 96) : background,
    ...sidebarTokens(palette.sidebarFrom, palette.sidebarTo),
    ...chartTokens(palette.charts),
  };
}

/** Dark colors made from the light picks, for themes without hand-tuned ones. */
export function generatedDark(palette: ThemePalette): ThemePaletteDark {
  const p = hexToHsl(palette.primary);
  const from = hexToHsl(palette.sidebarFrom);
  const to = hexToHsl(palette.sidebarTo);
  const hex = (h: number, s: number, l: number) => hslToHex(h, s, l);
  const lifted = (value: string) => {
    const c = hexToHsl(value);
    return hex(c.h, c.s, Math.min(c.l + 9, 70));
  };

  return {
    background: hex(p.h, 30, 6.5),
    card: hex(p.h, 28, 9.5),
    foreground: hex(p.h, 30, 94),
    muted: hex(p.h, 14, 66),
    border: hex(p.h, 22, 19),
    primary: lifted(palette.primary),
    secondary: lifted(palette.secondary),
    accent: lifted(palette.accent),
    sidebarFrom: hex(from.h, from.s * 0.7, 14),
    sidebarTo: hex(to.h, to.s * 0.7, 17),
  };
}

export function darkPaletteVariables(palette: ThemePalette): PaletteVariables {
  const d = palette.dark ?? generatedDark(palette);
  const bg = hexToHsl(d.background);
  const s = hexToHsl(d.secondary);
  const a = hexToHsl(d.accent);

  return {
    "--background": hexChannels(d.background),
    "--foreground": hexChannels(d.foreground),
    "--card": hexChannels(d.card),
    "--card-foreground": hexChannels(d.foreground),
    "--popover": hexChannels(d.card),
    "--popover-foreground": hexChannels(d.foreground),
    "--primary": hexChannels(d.primary),
    "--primary-foreground": textOn(d.primary),
    "--ring": hexChannels(d.primary),
    "--secondary": channels(s.h, Math.min(s.s, 40), 16),
    "--secondary-foreground": channels(s.h, Math.min(s.s, 85), 85),
    "--muted": channels(bg.h, bg.s, bg.l + 7),
    "--muted-foreground": hexChannels(d.muted),
    "--accent": channels(a.h, Math.min(a.s, 40), 17),
    "--accent-foreground": channels(a.h, Math.min(a.s, 85), 82),
    "--border": hexChannels(d.border),
    "--input": hexChannels(d.border),
    "--brand-secondary": hexChannels(d.secondary),
    "--sidebar-ring": hexChannels(d.primary),
    "--wash-1": hexChannels(d.card),
    "--wash-2": hexChannels(d.background),
    "--wash-3": channels(s.h, 30, 10),
    ...sidebarTokens(d.sidebarFrom, d.sidebarTo),
    ...chartTokens(palette.charts),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const lig = Math.max(0, Math.min(100, l)) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) => lig - sat * Math.min(lig, 1 - lig) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return `#${[f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

/** Gradients built from the variables, redefined where the variables change (a preview scope). */
const GRADIENT_VARIABLES =
  "--gradient-button: linear-gradient(var(--gradient-angle), hsl(var(--primary)), hsl(var(--brand-secondary)));" +
  "--gradient-dashboard: linear-gradient(var(--gradient-angle), hsl(var(--wash-1)), hsl(var(--wash-2)) 50%, hsl(var(--wash-3)));" +
  "--gradient-sidebar: linear-gradient(var(--gradient-angle), hsl(var(--soft-1)), hsl(var(--soft-2)));";

function block(selector: string, variables: PaletteVariables, extra = ""): string {
  const body = Object.entries(variables)
    .map(([name, value]) => `${name}:${value};`)
    .join("");
  return `${selector}{${body}${extra}}`;
}

/** Every value must be a validated hex before it is written into a style tag. */
export function isSafePalette(palette: ThemePalette | null | undefined): palette is ThemePalette {
  if (!palette) return false;
  const light = [palette.primary, palette.secondary, palette.accent, palette.sidebarFrom, palette.sidebarTo, ...palette.charts];
  const dark = palette.dark ? Object.values(palette.dark) : [];
  return [...light, ...dark].every(isHexColor) && ["white", "soft", "strong"].includes(palette.background);
}

/**
 * The page-level style: `html[data-palette="on"]` beats the `data-theme-color` and
 * `.dark` blocks in globals.css by specificity, without `!important`.
 */
export function paletteCss(palette: ThemePalette | null | undefined): string {
  if (!isSafePalette(palette)) return "";
  return (
    block('html[data-palette="on"]:not(.dark)', lightPaletteVariables(palette)) +
    block('html.dark[data-palette="on"]', darkPaletteVariables(palette))
  );
}

const RADIUS_REM: Record<string, string> = { "0": "0rem", "0.3": "0.3rem", "0.5": "0.5rem", "0.75": "0.75rem", "1.0": "1rem" };
const SHADOW_CARD: Record<string, string> = {
  none: "none",
  soft: "0 1px 2px hsl(215 28% 10% / 0.05), 0 8px 24px hsl(215 28% 10% / 0.06)",
  medium: "0 1px 2px rgb(0 0 0 / 0.08), 0 10px 24px rgb(0 0 0 / 0.1)",
  strong: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
};
const FONT_WEIGHTS: Record<string, [number, number, number, number]> = {
  light: [300, 400, 500, 600],
  regular: [400, 500, 600, 700],
  bold: [500, 600, 700, 700],
};
const GRADIENT_STYLE: Record<string, string | null> = {
  brand: null,
  ocean: "linear-gradient(var(--gradient-angle), hsl(199 89% 42%), hsl(217 91% 53%))",
  sunset: "linear-gradient(var(--gradient-angle), hsl(24.6 95% 53.1%), hsl(346.8 77.2% 49.8%))",
};

const CARD_EDGES: Record<string, { top: string; ring: string }> = {
  off: { top: "0px", ring: "0px" },
  top: { top: "3px", ring: "0px" },
  full: { top: "2px", ring: "1.5px" },
};

/** Dashboard card accent variables (mirrors the html[data-card-*] blocks in globals.css). */
function cardAccentVariables(settings: Pick<ThemeSettings, "cardBorder" | "cardColors">): string {
  const edge = CARD_EDGES[settings.cardBorder] ?? CARD_EDGES.off;
  const border = settings.cardBorder === "full" ? "transparent" : "hsl(var(--border) / var(--border-strength))";
  const tones = [1, 2, 3, 4, 5]
    .map((index) => `--dash-tone-${index}:${settings.cardColors === "brand" ? "var(--primary)" : `var(--chart-${index})`};`)
    .join("");
  return `--dash-card-top:${edge.top};--dash-card-ring:${edge.ring};--dash-card-border:${border};${tones}`;
}

/**
 * A preview scope: palette colors plus the shape options, on `[data-theme-preview=id]`.
 * Its `.dark` variant is chosen by adding the class to the preview root.
 */
export function previewCss(id: string, settings: Omit<ThemeSettings, "overrides" | "themeId">, palette: ThemePalette): string {
  if (!isSafePalette(palette) || !/^[a-z0-9-]+$/i.test(id)) return "";
  const scope = `[data-theme-preview="${id}"]`;
  const radius = RADIUS_REM[settings.radius] ?? "0.5rem";
  const token = (value: string, fallback: string) => (value === "match" ? fallback : RADIUS_REM[value] ?? fallback);
  const style = GRADIENT_STYLE[settings.gradientStyle];
  const [normal, medium, semibold, bold] = FONT_WEIGHTS[settings.fontWeight] ?? FONT_WEIGHTS.regular;
  const shape =
    `--font-weight-normal:${normal};--font-weight-medium:${medium};--font-weight-semibold:${semibold};--font-weight-bold:${bold};font-weight:${normal};` +
    `--radius:${radius};` +
    `--radius-button:${token(settings.buttonRadius, `calc(${radius} - 2px)`)};` +
    `--radius-card:${token(settings.cardRadius, "0.75rem")};` +
    `--radius-dialog:${token(settings.dialogRadius, radius)};` +
    `--shadow-card:${SHADOW_CARD[settings.shadow] ?? "none"};` +
    `--gradient-angle:${Number(settings.gradientAngle) || 135}deg;` +
    GRADIENT_VARIABLES +
    (style ? `--gradient-button:${style};` : "") +
    cardAccentVariables(settings);

  return (
    block(`${scope}:not(.dark)`, lightPaletteVariables(palette), `${shape}--dash-icon-mix:#000;`) +
    block(`${scope}.dark`, darkPaletteVariables(palette), `${shape}--dash-icon-mix:#fff;`)
  );
}
