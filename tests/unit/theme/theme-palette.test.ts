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
  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «maps the picks to the app's light variables»।
  it("Theme palette: maps the picks to the app's light variables", () => {
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

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «gives a light sidebar dark text and white backgrounds no tint»।
  it("Theme palette: gives a light sidebar dark text and white backgrounds no tint", () => {
    const vars = lightPaletteVariables({ ...padma, sidebarFrom: "#FAFAFA", sidebarTo: "#F4F4F5", background: "white" });
    expect(vars["--sidebar-foreground"]).not.toBe("0 0% 98%");
    expect(vars["--background"]).toBe("0 0% 100%");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «uses hand-tuned dark colors when present, and generates them otherwise»।
  it("Theme palette: uses hand-tuned dark colors when present, and generates them otherwise", () => {
    const dark = generatedDark(padma);
    expect(dark.background).toMatch(/^#[0-9A-F]{6}$/);
    expect(darkPaletteVariables(padma)["--background"]).toBe(darkPaletteVariables({ ...padma, dark })["--background"]);
    const tuned = darkPaletteVariables({ ...padma, dark: { ...dark, background: "#1A0F0D" } });
    expect(tuned["--background"]).toBe(hexToHslChannels("#1A0F0D"));
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «writes page CSS only for a valid palette»।
  it("Theme palette: writes page CSS only for a valid palette", () => {
    const css = paletteCss(padma);
    expect(css).toContain('html[data-palette="on"]:not(.dark){');
    expect(css).toContain('html.dark[data-palette="on"]{');
    expect(paletteCss(null)).toBe("");
    expect(paletteCss({ ...padma, primary: "red;}body{display:none" })).toBe("");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «scopes preview CSS to one element and refuses unsafe ids»।
  it("Theme palette: scopes preview CSS to one element and refuses unsafe ids", () => {
    const settings = { ...DEFAULT_THEME_SETTINGS, palette: padma };
    expect(previewCss("tp-1", settings, padma)).toContain('[data-theme-preview="tp-1"]:not(.dark){');
    expect(previewCss('x"]{}', settings, padma)).toBe("");
    expect(previewCss("tp-2", { ...settings, fontWeight: "light" }, padma)).toContain("--font-weight-normal:300;");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sets the dashboard card accent variables in a preview scope»।
  it("Theme palette: sets the dashboard card accent variables in a preview scope", () => {
    const settings = { ...DEFAULT_THEME_SETTINGS, palette: padma };
    const off = previewCss("tp-3", settings, padma);
    expect(off).toContain("--dash-card-top:0px;--dash-card-ring:0px;");
    expect(off).toContain("--dash-tone-1:var(--chart-1);");
    expect(off).toContain("--dash-icon-mix:#000;");
    expect(off).toContain("--dash-icon-mix:#fff;");

    const full = previewCss("tp-4", { ...settings, cardBorder: "full", cardColors: "brand" }, padma);
    expect(full).toContain("--dash-card-top:2px;--dash-card-ring:1.5px;--dash-card-border:transparent;");
    expect(full).toContain("--dash-tone-5:var(--primary);");
    expect(previewCss("tp-5", { ...settings, cardBorder: "top" }, padma)).toContain("--dash-card-top:3px;");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads the card options as off and multicolor for themes saved before they existed»।
  it("Theme palette: reads the card options as off and multicolor for themes saved before they existed", () => {
    const { cardBorder: _border, cardColors: _colors, ...older } = { ...DEFAULT_THEME_SETTINGS, palette: padma };
    const settings = settingsFromTheme(older as typeof DEFAULT_THEME_SETTINGS, "old");
    expect(settings.cardBorder).toBe("off");
    expect(settings.cardColors).toBe("multi");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «fills font weight for themes saved before the option existed»।
  it("Theme palette: fills font weight for themes saved before the option existed", () => {
    const { fontWeight: _unused, ...older } = { ...DEFAULT_THEME_SETTINGS, palette: padma };
    expect(settingsFromTheme(older as typeof DEFAULT_THEME_SETTINGS, "old").fontWeight).toBe("regular");
  });
});

describe("saved theme settings on the device", () => {
  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «drops overrides and uses the default preset for a colorful theme»।
  it("Theme palette: drops overrides and uses the default preset for a colorful theme", () => {
    const settings = settingsFromTheme({ ...DEFAULT_THEME_SETTINGS, preset: "jomuna", palette: padma }, "theme-1");
    expect(settings.preset).toBe("default");
    expect(settings.overrides).toEqual({});
    expect(settings.themeId).toBe("theme-1");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps a preset theme as it is»।
  it("Theme palette: keeps a preset theme as it is", () => {
    const settings = settingsFromTheme({ ...DEFAULT_THEME_SETTINGS, preset: "jomuna", palette: null }, "theme-2");
    expect(settings.preset).toBe("jomuna");
    expect(settings.palette).toBeNull();
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads the palette back from the cookie and ignores a broken one»।
  it("Theme palette: reads the palette back from the cookie and ignores a broken one", () => {
    const good = readThemeSettings({ themePrefs: JSON.stringify({ palette: padma, themeId: "abc" }) });
    expect(good.settings.palette?.primary).toBe("#F0543C");
    expect(good.settings.themeId).toBe("abc");

    const broken = readThemeSettings({ themePrefs: JSON.stringify({ palette: { ...padma, charts: ["#000000"] } }) });
    expect(broken.settings.palette).toBeNull();
  });
});
