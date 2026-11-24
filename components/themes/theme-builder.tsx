"use client";

import MyButton from "@/components/my-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import useApiMutation from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import {
  THEME_CARD_BORDERS,
  THEME_CARD_COLORS,
  THEME_FONT_WEIGHTS,
  THEME_RADII,
  THEME_RADIUS_TOKENS,
  type ThemePalette,
  type ThemeRecordSettings,
} from "@/types/theme-types";
import { Check, Lock, Moon, Sun } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  recordSettings,
  THEMES_QUERY_KEY,
  type SaveThemePayload,
  type SavedTheme,
  type ThemeVisibility,
} from "@/components/themes/theme-api";
import { ThemePreview } from "@/components/themes/theme-preview";
import { displayPalette, THEME_SWATCHES } from "@/components/themes/theme-presets";

export interface ThemeDraft {
  name: string;
  visibility: ThemeVisibility;
  /** The ISPTIK theme the draft started from, for the highlighted card. */
  startId: string | null;
  settings: ThemeRecordSettings;
}

type ColorKey = "primary" | "secondary" | "accent";
type OptionKey = Exclude<keyof ThemeRecordSettings, "palette" | "color" | "preset">;

const OPTION_SECTIONS = ["shape", "text", "effects", "cards"] as const;
type OptionSection = (typeof OPTION_SECTIONS)[number];

/** Single-choice option groups, shown as chips. Add the next theme option here. */
const OPTION_GROUPS: { section: OptionSection; key: OptionKey; values: readonly string[]; label: string }[] = [
  { section: "shape", key: "radius", values: THEME_RADII, label: "theme_customizer.radius.label" },
  { section: "shape", key: "buttonRadius", values: THEME_RADIUS_TOKENS, label: "theme_customizer.appearance.button_radius" },
  { section: "shape", key: "cardRadius", values: THEME_RADIUS_TOKENS, label: "theme_customizer.appearance.card_radius" },
  { section: "shape", key: "dialogRadius", values: THEME_RADIUS_TOKENS, label: "theme_customizer.appearance.dialog_radius" },
  { section: "text", key: "font", values: ["geist", "plex"], label: "themes.builder.font" },
  { section: "text", key: "fontSize", values: ["sm", "md", "lg"], label: "themes.builder.font_size" },
  { section: "text", key: "fontWeight", values: THEME_FONT_WEIGHTS, label: "themes.builder.font_weight" },
  { section: "text", key: "density", values: ["compact", "comfortable", "large"], label: "theme_customizer.density.label" },
  { section: "effects", key: "shadow", values: ["none", "soft", "medium", "strong"], label: "theme_customizer.appearance.shadow" },
  { section: "effects", key: "border", values: ["hairline", "subtle", "strong"], label: "theme_customizer.appearance.border" },
  { section: "effects", key: "gradients", values: ["on", "off"], label: "themes.builder.gradients" },
  { section: "effects", key: "gradientStyle", values: ["brand", "ocean", "sunset"], label: "themes.builder.gradient_style" },
  { section: "effects", key: "gradientAngle", values: ["90", "135", "180"], label: "themes.builder.gradient_angle" },
  { section: "effects", key: "navDrawerSide", values: ["left", "right"], label: "theme_customizer.mobile_drawer.label" },
  { section: "cards", key: "cardBorder", values: THEME_CARD_BORDERS, label: "themes.builder.card_border" },
  { section: "cards", key: "cardColors", values: THEME_CARD_COLORS, label: "themes.builder.card_colors" },
];

function optionLabel(key: OptionKey, value: string, t: (key: string) => string): string {
  if (value === "match") return t("theme_customizer.appearance.match");
  switch (key) {
    case "font":
    case "fontSize":
      return t(`theme_customizer.typography.${value}`);
    case "fontWeight":
      return t(`themes.builder.font_weights.${value}`);
    case "density":
      return t(`theme_customizer.density.${value}`);
    case "shadow":
      return t(`theme_customizer.appearance.shadow_${value}`);
    case "border":
      return t(`theme_customizer.appearance.border_${value}`);
    case "gradients":
      return t(`themes.builder.on_off.${value}`);
    case "gradientStyle":
      return t(`theme_customizer.gradients.${value}`);
    case "gradientAngle":
      return `${value}°`;
    case "navDrawerSide":
      return t(`theme_customizer.mobile_drawer.${value}`);
    case "cardBorder":
      return t(`themes.builder.card_borders.${value}`);
    case "cardColors":
      return t(`themes.builder.card_color_options.${value}`);
    default:
      return value;
  }
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid min-w-0 gap-4 border-t pt-5 first:border-t-0 first:pt-0">
      <legend className="float-left mb-1 w-full text-base font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

/**
 * Create or edit a staff theme. Typed input is only the name; everything else is a
 * click. The live preview on the right uses the theme's own variables.
 */
export function ThemeBuilder({
  systemThemes,
  initial,
  editingId,
  onCancel,
  onSaved,
}: {
  systemThemes: SavedTheme[];
  initial: ThemeDraft;
  /** Set when editing one of the user's own themes. */
  editingId: string | null;
  onCancel: () => void;
  onSaved: (theme: SavedTheme, created: boolean) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ThemeDraft>(initial);
  const [nameError, setNameError] = useState<string | null>(null);
  const [previewDark, setPreviewDark] = useState(false);
  const palette = displayPalette(draft.settings);
  const systemNames = useMemo(() => systemThemes.map((theme) => theme.name.toLowerCase()), [systemThemes]);

  const sidebarChoices = useMemo(
    () => systemThemes.map((theme) => ({ id: theme.id, name: theme.name, palette: displayPalette(theme.settings) })),
    [systemThemes],
  );

  const { mutate: save, isPending } = useApiMutation<SavedTheme, SaveThemePayload>({
    url: editingId ? `/themes/${editingId}` : "/themes",
    method: editingId ? "PUT" : "POST",
    invalidateKeys: THEMES_QUERY_KEY,
    successMessage: editingId ? "themes.builder.updated" : "themes.builder.created",
    onSuccess: (theme) => onSaved(theme, !editingId),
  });

  const setSettings = (patch: Partial<ThemeRecordSettings>) =>
    setDraft((current) => ({ ...current, settings: { ...current.settings, ...patch } }));

  /** A color change turns a preset theme into a colorful one and regenerates dark mode. */
  const setPalette = (patch: Partial<ThemePalette>, keepDark = false) =>
    setDraft((current) => {
      const base = displayPalette(current.settings);
      return {
        ...current,
        settings: {
          ...current.settings,
          preset: "default",
          palette: { ...base, ...patch, dark: keepDark ? base.dark : null },
        },
      };
    });

  const startFrom = (theme: SavedTheme) =>
    setDraft((current) => ({ ...current, startId: theme.id, settings: recordSettings(theme.settings) }));

  const reset = () => {
    const start = systemThemes.find((theme) => theme.id === draft.startId);
    setDraft(start ? { ...draft, settings: recordSettings(start.settings) } : { ...initial, name: draft.name });
  };

  const submit = () => {
    const name = draft.name.trim();
    if (!name) {
      setNameError(t("themes.builder.name_required"));
      return;
    }
    if (systemNames.includes(name.toLowerCase())) {
      setNameError(t("themes.builder.name_reserved"));
      return;
    }
    setNameError(null);
    save({ name, visibility: draft.visibility, settings: recordSettings(draft.settings) });
  };

  const colorRow = (key: ColorKey) => {
    const current = palette[key].toUpperCase();
    const swatches = THEME_SWATCHES.includes(current as (typeof THEME_SWATCHES)[number])
      ? THEME_SWATCHES
      : [current, ...THEME_SWATCHES];
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-label={t(`themes.builder.colors.${key}`)}>
        {swatches.map((hex) => {
          const selected = hex === current;
          return (
            <button
              key={hex}
              type="button"
              aria-pressed={selected}
              aria-label={`${t(`themes.builder.colors.${key}`)} ${hex}`}
              title={hex}
              onClick={() => setPalette({ [key]: hex })}
              // The swatch color is the data itself, so it can only be set inline.
              style={{ backgroundColor: hex }}
              className={cn(
                "grid size-7 place-items-center rounded-full border-2 border-background ring-1 ring-border transition-shadow",
                selected && "ring-2 ring-foreground",
              )}
            >
              {selected && <Check className="size-3.5 text-white drop-shadow" />}
            </button>
          );
        })}
      </div>
    );
  };

  const optionGroup = (key: OptionKey, values: readonly string[]) => {
    const disabled = (key === "gradientStyle" || key === "gradientAngle") && draft.settings.gradients === "off";
    return (
      <ToggleGroup
        type="single"
        value={String(draft.settings[key])}
        onValueChange={(value) => value && setSettings({ [key]: value } as Partial<ThemeRecordSettings>)}
        className="flex flex-wrap justify-start gap-2"
        disabled={disabled}
      >
        {values.map((value) => (
          <ToggleGroupItem
            key={value}
            value={value}
            variant={String(draft.settings[key]) === value ? "default" : "outline"}
            className="h-8 px-3 text-xs"
          >
            {optionLabel(key, value, t)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  };

  return (
    <div className="grid min-h-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <form
        className="grid min-w-0 content-start gap-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Section title={t("themes.builder.sections.about")}>
          <Field label={t("themes.builder.name")} hint={t("themes.builder.required")}>
            <Input
              id="theme-name"
              value={draft.name}
              maxLength={40}
              autoComplete="off"
              placeholder={t("themes.builder.name_placeholder")}
              aria-invalid={nameError ? true : undefined}
              aria-describedby="theme-name-error"
              onChange={(event) => {
                setNameError(null);
                setDraft({ ...draft, name: event.target.value });
              }}
            />
            <p id="theme-name-error" role="alert" className="min-h-4 text-xs text-destructive">
              {nameError}
            </p>
          </Field>
          <Field label={t("themes.builder.start_from")} hint={t("themes.builder.start_hint")}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2" role="group" aria-label={t("themes.builder.start_from")}>
              {systemThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  aria-pressed={draft.startId === theme.id}
                  onClick={() => startFrom(theme)}
                  className={cn(
                    "grid gap-1.5 rounded-lg border bg-card p-1.5 text-left transition-shadow hover:bg-accent/40",
                    draft.startId === theme.id && "border-foreground ring-1 ring-foreground",
                  )}
                >
                  <span className="block h-8 overflow-hidden rounded-md border">
                    <ThemePreview settings={theme.settings} dark={false} variant="card" />
                  </span>
                  <span className="flex items-center justify-between gap-1 px-0.5 text-xs font-medium">
                    <span className="truncate">{theme.name}</span>
                    <Lock className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          </Field>
        </Section>

        <Section title={t("themes.builder.sections.colors")}>
          <Field label={t("themes.builder.colors.primary")} hint={t("themes.builder.colors.primary_hint")}>{colorRow("primary")}</Field>
          <Field label={t("themes.builder.colors.secondary")} hint={t("themes.builder.colors.secondary_hint")}>{colorRow("secondary")}</Field>
          <Field label={t("themes.builder.colors.accent")} hint={t("themes.builder.colors.accent_hint")}>{colorRow("accent")}</Field>
          <Field label={t("themes.builder.colors.sidebar")}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2" role="group" aria-label={t("themes.builder.colors.sidebar")}>
              {sidebarChoices.map((choice) => {
                const selected = palette.sidebarFrom === choice.palette.sidebarFrom && palette.sidebarTo === choice.palette.sidebarTo;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPalette({ sidebarFrom: choice.palette.sidebarFrom, sidebarTo: choice.palette.sidebarTo })}
                    className={cn("overflow-hidden rounded-md border-2 border-background ring-1 ring-border", selected && "ring-2 ring-foreground")}
                  >
                    <span className="block h-8">
                      <ThemePreview
                        settings={{ ...draft.settings, palette: { ...palette, sidebarFrom: choice.palette.sidebarFrom, sidebarTo: choice.palette.sidebarTo } }}
                        dark={false}
                        variant="sidebar"
                      />
                    </span>
                    <span className="block truncate bg-card px-1 py-0.5 text-[0.7rem] font-medium">{choice.name}</span>
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label={t("themes.builder.colors.background")}>
            <ToggleGroup
              type="single"
              value={palette.background}
              onValueChange={(value) => value && setPalette({ background: value as ThemePalette["background"] })}
              className="flex flex-wrap justify-start gap-2"
            >
              {(["white", "soft", "strong"] as const).map((value) => (
                <ToggleGroupItem key={value} value={value} variant={palette.background === value ? "default" : "outline"} className="h-8 px-3 text-xs">
                  {t(`themes.builder.backgrounds.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
          <Field label={t("themes.builder.colors.charts")} hint={t("themes.builder.colors.charts_hint")}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2" role="group" aria-label={t("themes.builder.colors.charts")}>
              {sidebarChoices.map((choice) => {
                const selected = choice.palette.charts.join() === palette.charts.join();
                return (
                  <button
                    key={choice.id}
                    type="button"
                    aria-pressed={selected}
                    title={choice.name}
                    aria-label={`${t("themes.builder.colors.charts")}: ${choice.name}`}
                    onClick={() => setPalette({ charts: [...choice.palette.charts] }, true)}
                    className={cn("flex h-7 overflow-hidden rounded-md border-2 border-background ring-1 ring-border", selected && "ring-2 ring-foreground")}
                  >
                    {choice.palette.charts.map((hex) => (
                      // Chart colors are the data itself.
                      <span key={hex} className="block h-full flex-1" style={{ backgroundColor: hex }} />
                    ))}
                  </button>
                );
              })}
            </div>
          </Field>
        </Section>

        {OPTION_SECTIONS.map((section) => (
          <Section key={section} title={t(`themes.builder.sections.${section}`)}>
            <div className="grid gap-4 sm:grid-cols-2">
              {OPTION_GROUPS.filter((group) => group.section === section).map((group) => (
                <Field key={group.key} label={t(group.label)}>
                  {optionGroup(group.key, group.values)}
                </Field>
              ))}
            </div>
          </Section>
        ))}

        <Section title={t("themes.builder.sections.sharing")}>
          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={t("themes.builder.sections.sharing")}>
            {(["private", "shared"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={draft.visibility === value}
                onClick={() => setDraft({ ...draft, visibility: value })}
                className={cn(
                  "grid gap-0.5 rounded-lg border bg-card p-3 text-left hover:bg-accent/40",
                  draft.visibility === value && "border-foreground ring-1 ring-foreground",
                )}
              >
                <span className="text-sm font-medium">{t(`themes.visibility.${value}`)}</span>
                <span className="text-xs text-muted-foreground">{t(`themes.visibility.${value}_hint`)}</span>
              </button>
            ))}
          </div>
        </Section>

        <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap justify-end gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur">
          <MyButton type="button" action="reset" variant="outline" size="default" onClick={reset} title={t("themes.builder.reset")} />
          <MyButton type="button" action="cancel" variant="outline" size="default" onClick={onCancel} title={t("common.cancel")} />
          <MyButton type="submit" action="save" size="default" loading={isPending} disabled={isPending} title={t(editingId ? "themes.builder.save_changes" : "themes.builder.save")} />
        </div>
      </form>

      <aside className="min-w-0 lg:sticky lg:top-0 lg:self-start">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold">{draft.name.trim() || t("themes.builder.untitled")}</p>
          <ToggleGroup
            type="single"
            value={previewDark ? "dark" : "light"}
            onValueChange={(value) => value && setPreviewDark(value === "dark")}
            className="gap-1"
            aria-label={t("themes.preview.mode")}
          >
            <ToggleGroupItem value="light" variant={previewDark ? "outline" : "default"} className="h-8 px-3 text-xs">
              <Sun className="size-3.5" /> {t("theme_customizer.mode.light")}
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" variant={previewDark ? "default" : "outline"} className="h-8 px-3 text-xs">
              <Moon className="size-3.5" /> {t("theme_customizer.mode.dark")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ThemePreview settings={draft.settings} dark={previewDark} />
        <p className="mt-2 text-xs text-muted-foreground">{t("themes.preview.dark_hint")}</p>
      </aside>
    </div>
  );
}
