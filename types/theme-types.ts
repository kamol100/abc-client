export const THEME_COLORS = [
  "zinc",
  "rose",
  "blue",
  "green",
  "orange",
  "red",
  "pink",
  "indigo",
  "purple",
] as const;

export const THEME_DENSITIES = ["compact", "comfortable", "large"] as const;
export const THEME_RADII = ["0", "0.3", "0.5", "0.75", "1.0"] as const;
export const THEME_RADIUS_TOKENS = ["match", ...THEME_RADII] as const;
export const THEME_PRESETS = ["default", "jomuna"] as const;
export const THEME_GRADIENTS = ["on", "off"] as const;
export const THEME_GRADIENT_STYLES = ["brand", "ocean", "sunset"] as const;
export const THEME_GRADIENT_ANGLES = ["90", "135", "180"] as const;
export const THEME_FONTS = ["geist", "plex"] as const;
export const THEME_FONT_SIZES = ["sm", "md", "lg"] as const;
export const THEME_SHADOWS = ["none", "soft", "medium", "strong"] as const;
export const THEME_BORDERS = ["hairline", "subtle", "strong"] as const;
export const THEME_OVERRIDE_KEYS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "sidebar",
] as const;
export const THEME_MODES = ["light", "dark", "system"] as const;

export type ThemeColor = (typeof THEME_COLORS)[number];
export type ThemeDensity = (typeof THEME_DENSITIES)[number];
export type ThemeRadius = (typeof THEME_RADII)[number];
export type ThemeRadiusToken = (typeof THEME_RADIUS_TOKENS)[number];
export type ThemeNavDrawerSide = "left" | "right";
export type ThemePreset = (typeof THEME_PRESETS)[number];
export type ThemeGradients = (typeof THEME_GRADIENTS)[number];
export type ThemeGradientStyle = (typeof THEME_GRADIENT_STYLES)[number];
export type ThemeGradientAngle = (typeof THEME_GRADIENT_ANGLES)[number];
export type ThemeFont = (typeof THEME_FONTS)[number];
export type ThemeFontSize = (typeof THEME_FONT_SIZES)[number];
export type ThemeShadow = (typeof THEME_SHADOWS)[number];
export type ThemeBorder = (typeof THEME_BORDERS)[number];
export type ThemeOverrideKey = (typeof THEME_OVERRIDE_KEYS)[number];
export type ThemeMode = (typeof THEME_MODES)[number];
export type ThemeOverrides = Partial<Record<ThemeOverrideKey, string>>;

export interface ThemeSettings {
  color: ThemeColor;
  density: ThemeDensity;
  radius: ThemeRadius;
  navDrawerSide: ThemeNavDrawerSide;
  preset: ThemePreset;
  gradients: ThemeGradients;
  gradientStyle: ThemeGradientStyle;
  gradientAngle: ThemeGradientAngle;
  font: ThemeFont;
  fontSize: ThemeFontSize;
  shadow: ThemeShadow;
  border: ThemeBorder;
  buttonRadius: ThemeRadiusToken;
  cardRadius: ThemeRadiusToken;
  dialogRadius: ThemeRadiusToken;
  overrides: ThemeOverrides;
}

export interface ThemeSettingsContextValue {
  settings: ThemeSettings;
  setColor: (color: ThemeColor) => void;
  setDensity: (density: ThemeDensity) => void;
  setRadius: (radius: ThemeRadius) => void;
  setNavDrawerSide: (side: ThemeNavDrawerSide) => void;
  setPreset: (preset: ThemePreset) => void;
  setGradients: (gradients: ThemeGradients) => void;
  setGradientStyle: (style: ThemeGradientStyle) => void;
  setGradientAngle: (angle: ThemeGradientAngle) => void;
  setFont: (font: ThemeFont) => void;
  setFontSize: (size: ThemeFontSize) => void;
  setShadow: (shadow: ThemeShadow) => void;
  setBorder: (border: ThemeBorder) => void;
  setButtonRadius: (radius: ThemeRadiusToken) => void;
  setCardRadius: (radius: ThemeRadiusToken) => void;
  setDialogRadius: (radius: ThemeRadiusToken) => void;
  setOverride: (key: ThemeOverrideKey, value: string | null) => void;
  clearOverrides: () => void;
}
