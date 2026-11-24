import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeAccountSync } from "@/components/themes/theme-account-sync";
import type { SavedTheme } from "@/components/themes/theme-api";
import { DEFAULT_THEME_SETTINGS } from "@/lib/theme/theme-settings";
import type { ThemeSettings } from "@/types/theme-types";

const state = vi.hoisted(() => ({
  settings: null as ThemeSettings | null,
  themes: [] as SavedTheme[],
  activeId: null as string | null,
  applyTheme: vi.fn(),
}));

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));

vi.mock("@/context/theme-data-provider", () => ({
  useThemeSettings: () => ({ settings: state.settings, applyTheme: state.applyTheme }),
}));

vi.mock("@/components/themes/theme-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/themes/theme-api")>();
  return {
    ...actual,
    useThemes: () => ({ data: { data: { themes: state.themes, active_theme_id: state.activeId } } }),
  };
});

const { overrides: _overrides, themeId: _themeId, ...record } = DEFAULT_THEME_SETTINGS;

function savedTheme(settings = record): SavedTheme {
  return {
    id: "rickshaw", key: "rickshaw-art", name: "Rickshaw Art", is_system: true, is_mine: false,
    visibility: "shared", owner_name: null, schema_version: 1, settings, updated_at: null,
  };
}

describe("ThemeAccountSync", () => {
  beforeEach(() => {
    state.applyTheme = vi.fn();
    state.activeId = "rickshaw";
  });

  it("leaves the device alone when it already shows the active theme as saved", () => {
    state.themes = [savedTheme()];
    state.settings = { ...DEFAULT_THEME_SETTINGS, themeId: "rickshaw" };

    render(<ThemeAccountSync />);

    expect(state.applyTheme).not.toHaveBeenCalled();
  });

  it("re-applies the active theme once when its settings changed (a reseed added the card border)", () => {
    state.themes = [savedTheme({ ...record, cardBorder: "top" })];
    state.settings = { ...DEFAULT_THEME_SETTINGS, themeId: "rickshaw" };

    const { rerender } = render(<ThemeAccountSync />);
    rerender(<ThemeAccountSync />);

    expect(state.applyTheme).toHaveBeenCalledTimes(1);
    expect(state.applyTheme.mock.calls[0][0].cardBorder).toBe("top");
    expect(state.applyTheme.mock.calls[0][1]).toBe("rickshaw");
  });
});
