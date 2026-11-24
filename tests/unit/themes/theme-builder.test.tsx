import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeBuilder, type ThemeDraft } from "@/components/themes/theme-builder";
import type { SavedTheme } from "@/components/themes/theme-api";
import { DEFAULT_THEME_SETTINGS } from "@/lib/theme/theme-settings";
import type { ThemeRecordSettings } from "@/types/theme-types";

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({ useFetch }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

const { overrides: _overrides, themeId: _themeId, ...base } = DEFAULT_THEME_SETTINGS;
const presetSettings: ThemeRecordSettings = { ...base, preset: "jomuna", palette: null };
const colorfulSettings: ThemeRecordSettings = {
  ...base,
  gradients: "on",
  palette: {
    primary: "#0E9F6E",
    secondary: "#65A30D",
    accent: "#0D9488",
    sidebarFrom: "#065F46",
    sidebarTo: "#0F766E",
    background: "soft",
    charts: ["#0E9F6E", "#84CC16", "#14B8A6", "#F59E0B", "#0EA5E9"],
    dark: {
      background: "#08140F", card: "#0E1F17", foreground: "#E3F7EC", muted: "#8DB8A3", border: "#1D3A2C",
      primary: "#22C58B", secondary: "#A3E635", accent: "#2DD4BF", sidebarFrom: "#05372A", sidebarTo: "#073B38",
    },
  },
};

function systemTheme(id: string, name: string, settings: ThemeRecordSettings): SavedTheme {
  return { id, key: id, name, is_system: true, is_mine: false, visibility: "shared", owner_name: null, schema_version: 1, settings, updated_at: null };
}

const systemThemes = [systemTheme("jomuna", "Jomuna", presetSettings), systemTheme("sundarbans", "Sundarbans", colorfulSettings)];

function renderBuilder(initial: Partial<ThemeDraft> = {}, onSaved = vi.fn()) {
  const draft: ThemeDraft = { name: "", visibility: "private", startId: "jomuna", settings: presetSettings, ...initial };
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeBuilder systemThemes={systemThemes} initial={draft} editingId={null} onCancel={vi.fn()} onSaved={onSaved} />
    </QueryClientProvider>,
  );
  return onSaved;
}

describe("ThemeBuilder", () => {
  beforeEach(() => useFetch.mockReset());

  it("has one typed field, the name, and asks for it before saving", async () => {
    const user = userEvent.setup();
    renderBuilder();

    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "themes.builder.save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("themes.builder.name_required");
    expect(useFetch).not.toHaveBeenCalled();
  });

  it("refuses an ISPTIK theme name", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.type(screen.getByRole("textbox"), "sundarbans");
    await user.click(screen.getByRole("button", { name: "themes.builder.save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("themes.builder.name_reserved");
    expect(useFetch).not.toHaveBeenCalled();
  });

  it("builds the theme from clicks: a preset becomes colorful and dark mode is regenerated", async () => {
    const user = userEvent.setup();
    useFetch.mockResolvedValue({ success: true, data: { id: "new" } });
    const onSaved = renderBuilder();

    await user.type(screen.getByRole("textbox"), "  Office Sunrise ");
    await user.click(screen.getByRole("button", { name: "themes.builder.colors.primary #F0543C" }));
    await user.click(screen.getByRole("radio", { name: "themes.builder.backgrounds.strong" }));
    await user.click(screen.getByRole("radio", { name: "theme_customizer.appearance.shadow_none" }));
    await user.click(screen.getByRole("radio", { name: "themes.builder.font_weights.bold" }));
    await user.click(screen.getByRole("radio", { name: "themes.builder.card_borders.full" }));
    await user.click(screen.getByRole("radio", { name: "themes.builder.card_color_options.brand" }));
    await user.click(screen.getByRole("button", { name: /themes\.visibility\.shared/ }));
    await user.click(screen.getByRole("button", { name: "themes.builder.save" }));

    await waitFor(() => expect(useFetch).toHaveBeenCalledTimes(1));
    const call = useFetch.mock.calls[0][0];
    expect(call.url).toBe("/themes");
    expect(call.method).toBe("POST");
    expect(call.data.name).toBe("Office Sunrise");
    expect(call.data.visibility).toBe("shared");
    expect(call.data.settings.preset).toBe("default");
    expect(call.data.settings.shadow).toBe("none");
    expect(call.data.settings.fontWeight).toBe("bold");
    expect(call.data.settings.cardBorder).toBe("full");
    expect(call.data.settings.cardColors).toBe("brand");
    expect(call.data.settings.palette).toMatchObject({ primary: "#F0543C", background: "strong", dark: null });
    expect(Object.keys(call.data.settings)).not.toContain("overrides");
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith({ id: "new" }, true));
  });

  it("keeps an ISPTIK theme's hand-tuned dark colors when only chart colors change", async () => {
    const user = userEvent.setup();
    useFetch.mockResolvedValue({ success: true, data: { id: "new" } });
    renderBuilder();

    const startFrom = screen.getByRole("group", { name: "themes.builder.start_from" });
    await user.click(within(startFrom).getByRole("button", { name: "Sundarbans" }));
    await user.click(screen.getByRole("button", { name: "themes.builder.colors.charts: Jomuna" }));
    await user.type(screen.getByRole("textbox"), "Green copy");
    await user.click(screen.getByRole("button", { name: "themes.builder.save" }));

    await waitFor(() => expect(useFetch).toHaveBeenCalledTimes(1));
    const palette = useFetch.mock.calls[0][0].data.settings.palette;
    expect(palette.primary).toBe("#0E9F6E");
    expect(palette.charts[0]).toBe("#0F766F");
    expect(palette.dark?.background).toBe("#08140F");
  });
});
