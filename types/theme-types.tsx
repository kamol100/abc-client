export type ThemeColor = "zinc" | "rose" | "blue" | "green" | "orange" | "red" | "pink" | "indigo" | "purple";
export type ThemeDensity = "compact" | "comfortable" | "large";
export type ThemeRadius = "0" | "0.3" | "0.5" | "0.75" | "1.0";
export type ThemeNavDrawerSide = "left" | "right";

export interface ThemeSettings {
  color: ThemeColor;
  density: ThemeDensity;
  radius: ThemeRadius;
  navDrawerSide: ThemeNavDrawerSide;
}

export interface ThemeSettingsContextValue {
  settings: ThemeSettings;
  setColor: (color: ThemeColor) => void;
  setDensity: (density: ThemeDensity) => void;
  setRadius: (radius: ThemeRadius) => void;
  setNavDrawerSide: (side: ThemeNavDrawerSide) => void;
}

