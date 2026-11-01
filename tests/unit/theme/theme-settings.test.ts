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
  it("converts hex colors to HSL channels and back", () => {
    const channels = hexToHslChannels("#0f766e");
    expect(channels).toBe("175.3 77.4% 26.1%");
    expect(hslChannelsToHex(channels ?? "")).toBe("#0f766e");
    expect(hexToHslChannels("nope")).toBeNull();
    expect(rgbStringToHex("rgb(15, 118, 110)")).toBe("#0f766e");
  });

  it("keeps saved color cookies when newer prefs are absent", () => {
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

  it("lets theme prefs override legacy cookies without filling missing fields", () => {
    const { settings } = readThemeSettings({
      themeColor: "blue",
      themePrefs: JSON.stringify({ preset: "namuna", gradients: "on", font: "plex" }),
    });

    expect(settings.color).toBe("blue");
    expect(settings.preset).toBe("namuna");
    expect(settings.gradients).toBe("on");
    expect(settings.font).toBe("plex");
    expect(settings.radius).toBe(DEFAULT_THEME_SETTINGS.radius);
  });

  it("ignores invalid preference payloads", () => {
    const { settings } = readThemeSettings({
      themeColor: "green",
      themePrefs: "{",
    });

    expect(settings.color).toBe("green");
    expect(settings.preset).toBe("default");
  });

  it("applies a preset bundle without changing navigation choices", () => {
    const next = settingsWithPreset(
      { ...DEFAULT_THEME_SETTINGS, color: "blue", density: "large", navDrawerSide: "left" },
      "namuna",
    );

    expect(next.preset).toBe("namuna");
    expect(next.gradients).toBe("on");
    expect(next.font).toBe("plex");
    expect(next.overrides).toEqual({});
    expect(next.color).toBe("blue");
    expect(next.density).toBe("large");
    expect(next.navDrawerSide).toBe("left");
  });

  it("turns a primary override into foreground and ring tokens", () => {
    const variables = themeOverrideVariables({ primary: "175.3 77.4% 26.1%" });
    expect(variables["--primary"]).toBe("175.3 77.4% 26.1%");
    expect(variables["--primary-foreground"]).toBe("0 0% 98%");
    expect(variables["--ring"]).toBe("175.3 77.4% 26.1%");
    expect(variables["--sidebar-primary"]).toBe("175.3 77.4% 26.1%");
  });

  it("uses dark text on a light background override", () => {
    const variables = themeOverrideVariables({ background: "0 0% 100%" });
    expect(variables["--background"]).toBe("0 0% 100%");
    expect(variables["--foreground"]).toBe("240 10% 3.9%");
    expect(variables["--card"]).toBe("0 0% 100%");
  });

  it("drops invalid override channels", () => {
    expect(themeOverrideVariables({ primary: "red" })).toEqual({});
  });

  it("accepts the previous theme payload and fills new defaults", () => {
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
