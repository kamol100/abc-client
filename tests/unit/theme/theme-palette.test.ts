import { describe, expect, it } from "vitest";
import {
  darkPaletteVariables,
  generatedDark,
  lightPaletteVariables,
  paletteCss,
  previewCss,
} from "@/lib/theme/theme-palette";
import { DEFAULT_THEME_SETTINGS, hexToHslChannels, readThemeSettings, settingsFromTheme } from "@/lib/theme/theme-settings";
import type { ThemePalette } from "@/types/theme-types";

const padma: ThemePalette = {
  primary: "#F0543C",
  secondary: "#E2337F",
  accent: "#F5A300",
  sidebarFrom: "#FF6A3D",
  sidebarTo: "#D9267A",
  background: "soft",
  charts: ["#F0543C", "#E2337F", "#F5A300", "#1FB5A6", "#6C5CE7"],
  dark: null,
};

describe("theme palette", () => {
  it("maps the picks to the app's light variables", () => {
    const vars = lightPaletteVariables(padma);
    // Same channels as the app's existing converter.
    expect(vars["--primary"]).toBe(hexToHslChannels("#F0543C"));
    expect(vars["--primary-foreground"]).toBe("0 0% 98%");
    expect(vars["--brand-secondary"]).toBe(hexToHslChannels("#E2337F"));
    expect(vars["--sidebar-from"]).toBe(hexToHslChannels("#FF6A3D"));
    expect(vars["--chart-5"]).toBe(hexToHslChannels("#6C5CE7"));
    // A saturated sidebar gets light text.
    expect(vars["--sidebar-foreground"]).toBe("0 0% 98%");
  });

  it("gives a light sidebar dark text and white backgrounds no tint", () => {
    const vars = lightPaletteVariables({ ...padma, sidebarFrom: "#FAFAFA", sidebarTo: "#F4F4F5", background: "white" });
    expect(vars["--sidebar-foreground"]).not.toBe("0 0% 98%");
    expect(vars["--background"]).toBe("0 0% 100%");
  });

  it("uses hand-tuned dark colors when present, and generates them otherwise", () => {
    const dark = generatedDark(padma);
    expect(dark.background).toMatch(/^#[0-9A-F]{6}$/);
    expect(darkPaletteVariables(padma)["--background"]).toBe(darkPaletteVariables({ ...padma, dark })["--background"]);
    const tuned = darkPaletteVariables({ ...padma, dark: { ...dark, background: "#1A0F0D" } });
    expect(tuned["--background"]).toBe(hexToHslChannels("#1A0F0D"));
  });

  it("writes page CSS only for a valid palette", () => {
    const css = paletteCss(padma);
    expect(css).toContain('html[data-palette="on"]:not(.dark){');
    expect(css).toContain('html.dark[data-palette="on"]{');
    expect(paletteCss(null)).toBe("");
    expect(paletteCss({ ...padma, primary: "red;}body{display:none" })).toBe("");
  });

  it("scopes preview CSS to one element and refuses unsafe ids", () => {
    const settings = { ...DEFAULT_THEME_SETTINGS, palette: padma };
    expect(previewCss("tp-1", settings, padma)).toContain('[data-theme-preview="tp-1"]:not(.dark){');
    expect(previewCss('x"]{}', settings, padma)).toBe("");
    expect(previewCss("tp-2", { ...settings, fontWeight: "light" }, padma)).toContain("--font-weight-normal:300;");
  });

  it("fills font weight for themes saved before the option existed", () => {
    const { fontWeight: _unused, ...older } = { ...DEFAULT_THEME_SETTINGS, palette: padma };
    expect(settingsFromTheme(older as typeof DEFAULT_THEME_SETTINGS, "old").fontWeight).toBe("regular");
  });
});

describe("saved theme settings on the device", () => {
  it("drops overrides and uses the default preset for a colorful theme", () => {
    const settings = settingsFromTheme({ ...DEFAULT_THEME_SETTINGS, preset: "jomuna", palette: padma }, "theme-1");
    expect(settings.preset).toBe("default");
    expect(settings.overrides).toEqual({});
    expect(settings.themeId).toBe("theme-1");
  });

  it("keeps a preset theme as it is", () => {
    const settings = settingsFromTheme({ ...DEFAULT_THEME_SETTINGS, preset: "jomuna", palette: null }, "theme-2");
    expect(settings.preset).toBe("jomuna");
    expect(settings.palette).toBeNull();
  });

  it("reads the palette back from the cookie and ignores a broken one", () => {
    const good = readThemeSettings({ themePrefs: JSON.stringify({ palette: padma, themeId: "abc" }) });
    expect(good.settings.palette?.primary).toBe("#F0543C");
    expect(good.settings.themeId).toBe("abc");

    const broken = readThemeSettings({ themePrefs: JSON.stringify({ palette: { ...padma, charts: ["#000000"] } }) });
    expect(broken.settings.palette).toBeNull();
  });
});
