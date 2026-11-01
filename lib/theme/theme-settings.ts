import { z } from "zod";
import {
  THEME_BORDERS,
  THEME_COLORS,
  THEME_DENSITIES,
  THEME_FONTS,
  THEME_FONT_SIZES,
  THEME_GRADIENT_ANGLES,
  THEME_GRADIENT_STYLES,
  THEME_GRADIENTS,
  THEME_MODES,
  THEME_OVERRIDE_KEYS,
  THEME_PRESETS,
  THEME_RADII,
  THEME_RADIUS_TOKENS,
  THEME_SHADOWS,
  type ThemeMode,
  type ThemeOverrideKey,
  type ThemeOverrides,
  type ThemePreset,
  type ThemeSettings,
} from "@/types/theme-types";

const hslChannelsSchema = z
  .string()
  .regex(/^(?:[0-9]{1,3})(?:\.[0-9]+)?\s+(?:[0-9]{1,3})(?:\.[0-9]+)?%\s+(?:[0-9]{1,3})(?:\.[0-9]+)?%$/)
  .refine((value) => {
    const [hue, saturation, lightness] = value.split(/\s+/);
    if (!hue || !saturation || !lightness) {
      return false;
    }
    const hueValue = Number(hue);
    const saturationValue = Number(saturation.replace("%", ""));
    const lightnessValue = Number(lightness.replace("%", ""));
    return hueValue <= 360 && saturationValue <= 100 && lightnessValue <= 100;
  });

const overridesSchema = z
  .object({
    primary: hslChannelsSchema.optional(),
    secondary: hslChannelsSchema.optional(),
    accent: hslChannelsSchema.optional(),
    background: hslChannelsSchema.optional(),
    sidebar: hslChannelsSchema.optional(),
  })
  .partial();

export const themePrefsSchema = z.object({
  color: z.enum(THEME_COLORS).optional(),
  density: z.enum(THEME_DENSITIES).optional(),
  radius: z.enum(THEME_RADII).optional(),
  navDrawerSide: z.enum(["left", "right"]).optional(),
  preset: z.enum(THEME_PRESETS).optional(),
  gradients: z.enum(THEME_GRADIENTS).optional(),
  gradientStyle: z.enum(THEME_GRADIENT_STYLES).optional(),
  gradientAngle: z.enum(THEME_GRADIENT_ANGLES).optional(),
  font: z.enum(THEME_FONTS).optional(),
  fontSize: z.enum(THEME_FONT_SIZES).optional(),
  shadow: z.enum(THEME_SHADOWS).optional(),
  border: z.enum(THEME_BORDERS).optional(),
  buttonRadius: z.enum(THEME_RADIUS_TOKENS).optional(),
  cardRadius: z.enum(THEME_RADIUS_TOKENS).optional(),
  dialogRadius: z.enum(THEME_RADIUS_TOKENS).optional(),
  overrides: overridesSchema.optional(),
});

export const themeSettingsSchema = themePrefsSchema.required({
  color: true,
  density: true,
  radius: true,
}).extend({
  navDrawerSide: z.enum(["left", "right"]).optional().default("right"),
  preset: z.enum(THEME_PRESETS).optional().default("default"),
  gradients: z.enum(THEME_GRADIENTS).optional().default("off"),
  gradientStyle: z.enum(THEME_GRADIENT_STYLES).optional().default("brand"),
  gradientAngle: z.enum(THEME_GRADIENT_ANGLES).optional().default("135"),
  font: z.enum(THEME_FONTS).optional().default("geist"),
  fontSize: z.enum(THEME_FONT_SIZES).optional().default("md"),
  shadow: z.enum(THEME_SHADOWS).optional().default("strong"),
  border: z.enum(THEME_BORDERS).optional().default("strong"),
  buttonRadius: z.enum(THEME_RADIUS_TOKENS).optional().default("match"),
  cardRadius: z.enum(THEME_RADIUS_TOKENS).optional().default("0.75"),
  dialogRadius: z.enum(THEME_RADIUS_TOKENS).optional().default("match"),
  overrides: overridesSchema.optional().default({}),
});

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  color: "zinc",
  density: "comfortable",
  radius: "0.5",
  navDrawerSide: "right",
  preset: "default",
  gradients: "off",
  gradientStyle: "brand",
  gradientAngle: "135",
  font: "geist",
  fontSize: "md",
  shadow: "strong",
  border: "strong",
  buttonRadius: "match",
  cardRadius: "0.75",
  dialogRadius: "match",
  overrides: {},
};

export const PRESET_BUNDLES: Record<ThemePreset, Partial<ThemeSettings>> = {
  default: {
    preset: "default",
    gradients: "off",
    gradientStyle: "brand",
    gradientAngle: "135",
    font: "geist",
    fontSize: "md",
    shadow: "strong",
    border: "strong",
    radius: "0.5",
    buttonRadius: "match",
    cardRadius: "0.75",
    dialogRadius: "match",
    overrides: {},
  },
  namuna: {
    preset: "namuna",
    gradients: "on",
    gradientStyle: "brand",
    gradientAngle: "135",
    font: "plex",
    fontSize: "md",
    shadow: "soft",
    border: "subtle",
    radius: "0.75",
    buttonRadius: "0.75",
    cardRadius: "0.75",
    dialogRadius: "1.0",
    overrides: {},
  },
};

const FOREGROUND_DARK = "240 10% 3.9%";
const FOREGROUND_LIGHT = "0 0% 98%";

export const THEME_OVERRIDE_PROPERTIES = [
  "--primary",
  "--primary-foreground",
  "--ring",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--sidebar-background",
  "--sidebar-foreground",
] as const;

export const THEME_BOOT_SCRIPT = `(function(){try{var mode=localStorage.getItem("theme");if(mode!=="light"&&mode!=="dark"&&mode!=="system")mode="light";var dark=mode==="dark"||(mode==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.remove("light","dark");root.classList.add(dark?"dark":"light");}catch(e){}})();`;

interface ThemeCookieInput {
  themeColor?: string;
  density?: string;
  radius?: string;
  navDrawerSide?: string;
  themePrefs?: string;
  themeMode?: string;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value !== undefined && allowed.includes(value as T) ? (value as T) : fallback;
}

function foregroundFor(channels: string): string {
  const lightness = Number(channels.split(/\s+/)[2]?.replace("%", ""));
  return lightness > 62 ? FOREGROUND_DARK : FOREGROUND_LIGHT;
}

function assignPair(
  target: Record<string, string>,
  channels: string | undefined,
  token: string,
  foregroundToken: string,
): void {
  if (!channels || !hslChannelsSchema.safeParse(channels).success) {
    return;
  }

  target[token] = channels;
  target[foregroundToken] = foregroundFor(channels);
}

export function hexToHslChannels(hex: string): string | null {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) {
    return null;
  }

  const value = Number.parseInt(match[1], 16);
  const red = ((value >> 16) & 255) / 255;
  const green = ((value >> 8) & 255) / 255;
  const blue = (value & 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
  }

  const round = (channel: number) => Math.round(channel * 10) / 10;
  const channels = `${round(hue)} ${round(saturation * 100)}% ${round(lightness * 100)}%`;
  return hslChannelsSchema.safeParse(channels).success ? channels : null;
}

export function hslChannelsToHex(channels: string): string | null {
  if (!hslChannelsSchema.safeParse(channels).success) {
    return null;
  }

  const [hueValue, saturationValue, lightnessValue] = channels.split(/\s+/);
  const hue = Number(hueValue) / 360;
  const saturation = Number(saturationValue.replace("%", "")) / 100;
  const lightness = Number(lightnessValue.replace("%", "")) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = hue * 6;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const match = lightness - chroma / 2;
  const channel = (index: number) => {
    if (index === 0) return [chroma, x, 0];
    if (index === 1) return [x, chroma, 0];
    if (index === 2) return [0, chroma, x];
    if (index === 3) return [0, x, chroma];
    if (index === 4) return [x, 0, chroma];
    return [chroma, 0, x];
  };
  const [red, green, blue] = channel(Math.floor(segment) % 6).map((part) =>
    Math.round((part + match) * 255),
  );
  return `#${[red, green, blue].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

export function rgbStringToHex(color: string): string | null {
  const match = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(color.trim());
  if (!match) {
    return null;
  }

  return `#${match
    .slice(1, 4)
    .map((part) => Number(part).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function themeOverrideVariables(overrides: ThemeOverrides): Record<string, string> {
  const variables: Record<string, string> = {};
  assignPair(variables, overrides.primary, "--primary", "--primary-foreground");
  if (variables["--primary"]) {
    variables["--ring"] = variables["--primary"];
    variables["--sidebar-primary"] = variables["--primary"];
    variables["--sidebar-primary-foreground"] = variables["--primary-foreground"];
  }
  assignPair(variables, overrides.secondary, "--secondary", "--secondary-foreground");
  assignPair(variables, overrides.accent, "--accent", "--accent-foreground");
  assignPair(variables, overrides.background, "--background", "--foreground");
  if (variables["--background"]) {
    variables["--card"] = variables["--background"];
    variables["--card-foreground"] = variables["--foreground"];
    variables["--popover"] = variables["--background"];
    variables["--popover-foreground"] = variables["--foreground"];
  }
  assignPair(variables, overrides.sidebar, "--sidebar-background", "--sidebar-foreground");
  return variables;
}

export function themeOverrideStyle(overrides: ThemeOverrides): Record<string, string> | undefined {
  const variables = themeOverrideVariables(overrides);
  return Object.keys(variables).length > 0 ? variables : undefined;
}

export function applyThemeAttributes(root: HTMLElement, settings: ThemeSettings): void {
  root.dataset.themeColor = settings.color;
  root.dataset.density = settings.density;
  root.dataset.radius = settings.radius;
  root.dataset.themePreset = settings.preset;
  root.dataset.gradients = settings.gradients;
  root.dataset.gradientStyle = settings.gradientStyle;
  root.dataset.gradientAngle = settings.gradientAngle;
  root.dataset.font = settings.font;
  root.dataset.fontSize = settings.fontSize;
  root.dataset.shadow = settings.shadow;
  root.dataset.border = settings.border;
  root.dataset.buttonRadius = settings.buttonRadius;
  root.dataset.cardRadius = settings.cardRadius;
  root.dataset.dialogRadius = settings.dialogRadius;

  const variables = themeOverrideVariables(settings.overrides);
  for (const property of THEME_OVERRIDE_PROPERTIES) {
    const value = variables[property];
    if (value) {
      root.style.setProperty(property, value);
    } else {
      root.style.removeProperty(property);
    }
  }
}

export function readThemeSettings(input: ThemeCookieInput): { settings: ThemeSettings; mode: ThemeMode } {
  const legacy: ThemeSettings = {
    ...DEFAULT_THEME_SETTINGS,
    color: oneOf(input.themeColor, THEME_COLORS, DEFAULT_THEME_SETTINGS.color),
    density: oneOf(input.density, THEME_DENSITIES, DEFAULT_THEME_SETTINGS.density),
    radius: oneOf(input.radius, THEME_RADII, DEFAULT_THEME_SETTINGS.radius),
    navDrawerSide: oneOf(input.navDrawerSide, ["left", "right"] as const, DEFAULT_THEME_SETTINGS.navDrawerSide),
  };

  let prefs: Partial<ThemeSettings> = {};
  if (input.themePrefs) {
    try {
      const parsed = themePrefsSchema.safeParse(JSON.parse(input.themePrefs));
      if (parsed.success) {
        prefs = parsed.data;
      }
    } catch {
      prefs = {};
    }
  }

  const overrides = Object.fromEntries(
    THEME_OVERRIDE_KEYS.flatMap((key) => {
      const value = prefs.overrides?.[key];
      return value ? [[key, value]] : [];
    }),
  ) as ThemeOverrides;

  return {
    settings: {
      ...legacy,
      ...prefs,
      overrides,
    },
    mode: oneOf(input.themeMode, THEME_MODES, "light"),
  };
}

export function settingsWithPreset(current: ThemeSettings, preset: ThemePreset): ThemeSettings {
  return {
    ...current,
    ...PRESET_BUNDLES[preset],
    color: current.color,
    density: current.density,
    navDrawerSide: current.navDrawerSide,
  };
}

export function writeThemeModeCookie(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `themeMode=${mode};path=/;max-age=31536000;samesite=lax`;
}

export function isThemeOverrideKey(value: string): value is ThemeOverrideKey {
  return THEME_OVERRIDE_KEYS.includes(value as ThemeOverrideKey);
}
