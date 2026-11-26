import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_SETTINGS,
  hexToHslChannels,
  hslChannelsToHex,
  readThemeSettings,
  rgbStringToHex,
  settingsWithPreset,
  themeOverrideVariables,
  themeSettingsSchema,
} from "@/lib/theme/theme-settings";

describe("theme settings", () => {
  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «converts hex colors to HSL channels and back»।
  it("Theme settings: converts hex colors to HSL channels and back", () => {
    const channels = hexToHslChannels("#0f766e");
    expect(channels).toBe("175.3 77.4% 26.1%");
    expect(hslChannelsToHex(channels ?? "")).toBe("#0f766e");
    expect(hexToHslChannels("nope")).toBeNull();
    expect(rgbStringToHex("rgb(15, 118, 110)")).toBe("#0f766e");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps saved color cookies when newer prefs are absent»।
  it("Theme settings: keeps saved color cookies when newer prefs are absent", () => {
    const { settings, mode } = readThemeSettings({
      themeColor: "blue",
      density: "compact",
      radius: "0.3",
      navDrawerSide: "left",
    });

    expect(settings.color).toBe("blue");
    expect(settings.density).toBe("compact");
    expect(settings.radius).toBe("0.3");
    expect(settings.navDrawerSide).toBe("left");
    expect(settings.preset).toBe("default");
    expect(settings.gradients).toBe("off");
    expect(mode).toBe("light");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «lets theme prefs override legacy cookies without filling missing fields»।
  it("Theme settings: lets theme prefs override legacy cookies without filling missing fields", () => {
    const { settings } = readThemeSettings({
      themeColor: "blue",
      themePrefs: JSON.stringify({ preset: "jomuna", gradients: "on", font: "plex" }),
    });

    expect(settings.color).toBe("blue");
    expect(settings.preset).toBe("jomuna");
    expect(settings.gradients).toBe("on");
    expect(settings.font).toBe("plex");
    expect(settings.radius).toBe(DEFAULT_THEME_SETTINGS.radius);
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads a saved Namuna preset as Jomuna»।
  it("Theme settings: reads a saved Namuna preset as Jomuna", () => {
    const { settings } = readThemeSettings({
      themePrefs: JSON.stringify({ preset: "namuna", gradients: "on" }),
    });

    expect(settings.preset).toBe("jomuna");
    expect(settings.gradients).toBe("on");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «ignores invalid preference payloads»।
  it("Theme settings: ignores invalid preference payloads", () => {
    const { settings } = readThemeSettings({
      themeColor: "green",
      themePrefs: "{",
    });

    expect(settings.color).toBe("green");
    expect(settings.preset).toBe("default");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «applies a preset bundle without changing navigation choices»।
  it("Theme settings: applies a preset bundle without changing navigation choices", () => {
    const next = settingsWithPreset(
      { ...DEFAULT_THEME_SETTINGS, color: "blue", density: "large", navDrawerSide: "left" },
      "jomuna",
    );

    expect(next.preset).toBe("jomuna");
    expect(next.gradients).toBe("on");
    expect(next.font).toBe("plex");
    expect(next.overrides).toEqual({});
    expect(next.color).toBe("blue");
    expect(next.density).toBe("large");
    expect(next.navDrawerSide).toBe("left");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «turns a primary override into foreground and ring tokens»।
  it("Theme settings: turns a primary override into foreground and ring tokens", () => {
    const variables = themeOverrideVariables({ primary: "175.3 77.4% 26.1%" });
    expect(variables["--primary"]).toBe("175.3 77.4% 26.1%");
    expect(variables["--primary-foreground"]).toBe("0 0% 98%");
    expect(variables["--ring"]).toBe("175.3 77.4% 26.1%");
    expect(variables["--sidebar-primary"]).toBe("175.3 77.4% 26.1%");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «uses dark text on a light background override»।
  it("Theme settings: uses dark text on a light background override", () => {
    const variables = themeOverrideVariables({ background: "0 0% 100%" });
    expect(variables["--background"]).toBe("0 0% 100%");
    expect(variables["--foreground"]).toBe("240 10% 3.9%");
    expect(variables["--card"]).toBe("0 0% 100%");
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «drops invalid override channels»।
  it("Theme settings: drops invalid override channels", () => {
    expect(themeOverrideVariables({ primary: "red" })).toEqual({});
  });

  // রং ও থিমের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «accepts the previous theme payload and fills new defaults»।
  it("Theme settings: accepts the previous theme payload and fills new defaults", () => {
    const parsed = themeSettingsSchema.parse({
      color: "pink",
      density: "comfortable",
      radius: "0.5",
    });

    expect(parsed.color).toBe("pink");
    expect(parsed.preset).toBe("default");
    expect(parsed.gradients).toBe("off");
    expect(parsed.navDrawerSide).toBe("right");
  });
});
