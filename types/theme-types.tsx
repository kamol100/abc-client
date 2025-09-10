type ThemeColors = "Zinc" | "Rose" | "Blue" | "Green" | "Orange";
interface ThemeColorStateParams {
  themeColor: ThemeColors;
  setThemeColor: (color: ThemeColors) => void;
}
