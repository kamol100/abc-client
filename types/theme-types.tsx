type ThemeColor = "zinc" | "rose" | "blue" | "green" | "orange" | "red";
type ThemeDensity = "compact" | "comfortable" | "large";
type ThemeRadius = "0" | "0.3" | "0.5" | "0.75" | "1.0";

interface ThemeSettings {
  color: ThemeColor;
  density: ThemeDensity;
  radius: ThemeRadius;
}

interface ThemeSettingsContextValue {
  settings: ThemeSettings;
  setColor: (color: ThemeColor) => void;
  setDensity: (density: ThemeDensity) => void;
  setRadius: (radius: ThemeRadius) => void;
}

