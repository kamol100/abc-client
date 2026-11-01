"use client";

import { Checked } from "@/components/icon";
import { MyButton } from "@/components/my-button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { THEME_RADII, useThemeSettings } from "@/context/theme-data-provider";
import { useTheme } from "@/context/theme-provider";
import { hexToHslChannels, hslChannelsToHex, rgbStringToHex } from "@/lib/theme/theme-settings";
import { cn } from "@/lib/utils";
import {
  THEME_RADIUS_TOKENS,
  type ThemeBorder,
  type ThemeColor,
  type ThemeDensity,
  type ThemeFont,
  type ThemeFontSize,
  type ThemeGradientAngle,
  type ThemeGradientStyle,
  type ThemeGradients,
  type ThemeMode,
  type ThemeNavDrawerSide,
  type ThemeOverrideKey,
  type ThemePreset,
  type ThemeRadius,
  type ThemeRadiusToken,
  type ThemeShadow,
} from "@/types/theme-types";
import {
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  Monitor,
  Moon,
  Square,
  Sun,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

const THEME_COLOR_OPTIONS: { value: ThemeColor; primary: string }[] = [
  { value: "green", primary: "142.1 76.2% 36.3%" },
  { value: "red", primary: "0 84.2% 60.2%" },
  { value: "zinc", primary: "240 5.9% 10%" },
  { value: "rose", primary: "346.8 77.2% 49.8%" },
  { value: "orange", primary: "24.6 95% 53.1%" },
  { value: "blue", primary: "221.2 83.2% 53.3%" },
  { value: "pink", primary: "330 81% 60%" },
  { value: "indigo", primary: "238.7 83.5% 58.6%" },
  { value: "purple", primary: "262.1 83.3% 57.8%" },
];

const DENSITY_OPTIONS: { value: ThemeDensity; icon: typeof Minimize }[] = [
  { value: "compact", icon: Minimize },
  { value: "comfortable", icon: Square },
  { value: "large", icon: Maximize },
];

const PRESET_OPTIONS: ThemePreset[] = ["default", "jomuna"];
const GRADIENT_STYLES: ThemeGradientStyle[] = ["brand", "ocean", "sunset"];
const GRADIENT_ANGLES: ThemeGradientAngle[] = ["90", "135", "180"];
const FONT_OPTIONS: ThemeFont[] = ["geist", "plex"];
const FONT_SIZES: ThemeFontSize[] = ["sm", "md", "lg"];
const SHADOW_OPTIONS: ThemeShadow[] = ["none", "soft", "medium", "strong"];
const BORDER_OPTIONS: ThemeBorder[] = ["hairline", "subtle", "strong"];
const OVERRIDE_FIELDS: { key: ThemeOverrideKey; tokenClass: string }[] = [
  { key: "primary", tokenClass: "bg-primary" },
  { key: "secondary", tokenClass: "bg-secondary" },
  { key: "accent", tokenClass: "bg-accent" },
  { key: "background", tokenClass: "bg-background" },
  { key: "sidebar", tokenClass: "bg-sidebar" },
];

interface ThemeSettingsPanelProps {
  variant?: "page" | "popover";
}

function ThemeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function TokenColorField({
  label,
  tokenClass,
  value,
  themeKey,
  onChange,
}: {
  label: string;
  tokenClass: string;
  value?: string;
  themeKey: string;
  onChange: (channels: string) => void;
}) {
  const probeId = useId();
  const [hex, setHex] = useState("#18181b");

  useEffect(() => {
    const converted = value ? hslChannelsToHex(value) : null;
    if (converted) {
      setHex(converted);
      return;
    }

    const probe = document.getElementById(probeId);
    if (!probe) {
      return;
    }

    const nextHex = rgbStringToHex(getComputedStyle(probe).backgroundColor);
    if (nextHex) {
      setHex(nextHex);
    }
  }, [probeId, themeKey, value]);

  return (
    <label className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span id={probeId} className={cn("pointer-events-none absolute size-0 opacity-0", tokenClass)} />
      <input
        type="color"
        aria-label={label}
        value={hex}
        onChange={(event) => {
          const channels = hexToHslChannels(event.target.value);
          if (!channels) {
            return;
          }
          setHex(event.target.value);
          onChange(channels);
        }}
        className="h-9 w-full cursor-pointer rounded-md border border-input bg-background"
      />
    </label>
  );
}

function ThemePreview() {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
      <div className="flex min-h-36">
        <div className="flex w-20 flex-col gap-1 bg-sidebar p-2 text-sidebar-foreground">
          <div className="theme-preview-nav px-2 py-1 text-xs font-medium">
            {t("theme_customizer.preview.nav")}
          </div>
          <div className="rounded-md px-2 py-1 text-xs text-sidebar-foreground/80">
            {t("theme_customizer.preview.idle")}
          </div>
        </div>
        <div className="theme-preview-canvas flex flex-1 flex-col gap-2 p-3">
          <div className="theme-gradient-card rounded-xl border bg-card p-3 shadow">
            <p className="text-xs text-muted-foreground">{t("theme_customizer.preview.kicker")}</p>
            <p className="mt-1 text-sm font-semibold">{t("theme_customizer.preview.sample")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="theme-preview-button px-3 py-1 text-xs font-medium">
              {t("theme_customizer.preview.primary")}
            </span>
            <span className="rounded-md border bg-background px-3 py-1 text-xs">
              {t("theme_customizer.preview.secondary")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemeSettingsPanel({ variant = "page" }: ThemeSettingsPanelProps) {
  const { t } = useTranslation();
  const {
    settings,
    setColor,
    setDensity,
    setRadius,
    setNavDrawerSide,
    setPreset,
    setGradients,
    setGradientStyle,
    setGradientAngle,
    setFont,
    setFontSize,
    setShadow,
    setBorder,
    setButtonRadius,
    setCardRadius,
    setDialogRadius,
    setOverride,
    clearOverrides,
  } = useThemeSettings();
  const { setTheme, theme } = useTheme();
  const themeKey = `${settings.preset}:${settings.color}:${settings.gradients}:${theme}`;

  return (
    <div className={cn("space-y-5", variant === "page" && "w-full max-w-5xl")}>
      {variant === "page" && (
        <div>
          <h2 className="text-lg font-semibold">{t("theme_customizer.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("theme_customizer.description")}</p>
        </div>
      )}

      <div className={cn("gap-6", variant === "page" && "grid lg:grid-cols-[minmax(0,1fr)_18rem]")}>
        <div className="space-y-5">
          <ThemeSection title={t("theme_customizer.sections.appearance")}>
            <Label className="text-sm font-medium">{t("theme_customizer.preset.label")}</Label>
            <ToggleGroup
              type="single"
              value={settings.preset}
              onValueChange={(value) => value && setPreset(value as ThemePreset)}
              className="mt-2 flex flex-wrap gap-2"
            >
              {PRESET_OPTIONS.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.preset === value ? "default" : "outline"}
                >
                  {t(`theme_customizer.preset.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">{t("theme_customizer.preset.hint")}</p>

            <Label className="mt-3 block text-sm font-medium">{t("theme_customizer.mode.label")}</Label>
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(value) => value && setTheme(value as ThemeMode)}
              className="mt-2 flex flex-wrap gap-2"
            >
              <ToggleGroupItem value="light" variant={theme === "light" ? "default" : "outline"}>
                <Sun className="h-4 w-4" /> {t("theme_customizer.mode.light")}
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" variant={theme === "dark" ? "default" : "outline"}>
                <Moon className="h-4 w-4" /> {t("theme_customizer.mode.dark")}
              </ToggleGroupItem>
              <ToggleGroupItem value="system" variant={theme === "system" ? "default" : "outline"}>
                <Monitor className="h-4 w-4" /> {t("theme_customizer.mode.system")}
              </ToggleGroupItem>
            </ToggleGroup>
          </ThemeSection>

          <ThemeSection title={t("theme_customizer.sections.colors")}>
            <ToggleGroup
              type="single"
              value={settings.color}
              onValueChange={(value) => value && setColor(value as ThemeColor)}
              className="grid grid-cols-3 gap-2"
            >
              {THEME_COLOR_OPTIONS.map(({ value, primary }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.color === value ? "default" : "outline"}
                >
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `hsl(${primary})` }}
                  >
                    {settings.color === value && <Checked />}
                  </div>
                  {t(`theme_customizer.color.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {OVERRIDE_FIELDS.map(({ key, tokenClass }) => (
                <TokenColorField
                  key={key}
                  label={t(`theme_customizer.colors.${key}`)}
                  tokenClass={tokenClass}
                  value={settings.overrides[key]}
                  themeKey={themeKey}
                  onChange={(channels) => setOverride(key, channels)}
                />
              ))}
            </div>
            <MyButton type="button" variant="ghost" size="sm" onClick={clearOverrides}>
              {t("theme_customizer.colors.reset")}
            </MyButton>
          </ThemeSection>

          <ThemeSection title={t("theme_customizer.sections.gradients")}>
            <ToggleGroup
              type="single"
              value={settings.gradients}
              onValueChange={(value) => value && setGradients(value as ThemeGradients)}
              className="flex flex-wrap gap-2"
            >
              {(["on", "off"] as const).map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.gradients === value ? "default" : "outline"}
                >
                  {t(`theme_customizer.gradients.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={settings.gradientStyle}
              onValueChange={(value) => value && setGradientStyle(value as ThemeGradientStyle)}
              className="flex flex-wrap gap-2"
            >
              {GRADIENT_STYLES.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.gradientStyle === value ? "default" : "outline"}
                >
                  {t(`theme_customizer.gradients.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={settings.gradientAngle}
              onValueChange={(value) => value && setGradientAngle(value as ThemeGradientAngle)}
              className="flex flex-wrap gap-2"
            >
              {GRADIENT_ANGLES.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.gradientAngle === value ? "default" : "outline"}
                >
                  {value}°
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </ThemeSection>

          <ThemeSection title={t("theme_customizer.sections.typography")}>
            <ToggleGroup
              type="single"
              value={settings.font}
              onValueChange={(value) => value && setFont(value as ThemeFont)}
              className="flex flex-wrap gap-2"
            >
              {FONT_OPTIONS.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.font === value ? "default" : "outline"}
                >
                  {t(`theme_customizer.typography.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={settings.fontSize}
              onValueChange={(value) => value && setFontSize(value as ThemeFontSize)}
              className="flex flex-wrap gap-2"
            >
              {FONT_SIZES.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.fontSize === value ? "default" : "outline"}
                >
                  {t(`theme_customizer.typography.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </ThemeSection>

          <ThemeSection title={t("theme_customizer.sections.layout")}>
            <Label className="text-sm font-medium">{t("theme_customizer.radius.label")}</Label>
            <ToggleGroup
              type="single"
              value={settings.radius}
              onValueChange={(value) => value && setRadius(value as ThemeRadius)}
              className="mt-2 grid grid-cols-5 gap-2"
            >
              {THEME_RADII.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.radius === value ? "default" : "outline"}
                >
                  {value}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Label className="mt-3 block text-sm font-medium">{t("theme_customizer.appearance.button_radius")}</Label>
            <RadiusTokenGroup value={settings.buttonRadius} onChange={setButtonRadius} />
            <Label className="mt-3 block text-sm font-medium">{t("theme_customizer.appearance.card_radius")}</Label>
            <RadiusTokenGroup value={settings.cardRadius} onChange={setCardRadius} />
            <Label className="mt-3 block text-sm font-medium">{t("theme_customizer.appearance.dialog_radius")}</Label>
            <RadiusTokenGroup value={settings.dialogRadius} onChange={setDialogRadius} />

            <Label className="mt-3 block text-sm font-medium">{t("theme_customizer.appearance.shadow")}</Label>
            <ToggleGroup
              type="single"
              value={settings.shadow}
              onValueChange={(value) => value && setShadow(value as ThemeShadow)}
              className="mt-2 flex flex-wrap gap-2"
            >
              {SHADOW_OPTIONS.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.shadow === value ? "default" : "outline"}
                >
                  {t(`theme_customizer.appearance.shadow_${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Label className="mt-3 block text-sm font-medium">{t("theme_customizer.appearance.border")}</Label>
            <ToggleGroup
              type="single"
              value={settings.border}
              onValueChange={(value) => value && setBorder(value as ThemeBorder)}
              className="mt-2 flex flex-wrap gap-2"
            >
              {BORDER_OPTIONS.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.border === value ? "default" : "outline"}
                >
                  {t(`theme_customizer.appearance.border_${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Label className="mt-3 block text-sm font-medium">{t("theme_customizer.density.label")}</Label>
            <ToggleGroup
              type="single"
              value={settings.density}
              onValueChange={(value) => value && setDensity(value as ThemeDensity)}
              className="mt-2 flex flex-wrap gap-2"
            >
              {DENSITY_OPTIONS.map(({ value, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.density === value ? "default" : "outline"}
                >
                  <Icon className="h-4 w-4" /> {t(`theme_customizer.density.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <Label className="mt-3 block text-sm font-medium">{t("theme_customizer.mobile_drawer.label")}</Label>
            <ToggleGroup
              type="single"
              value={settings.navDrawerSide}
              onValueChange={(value) => value && setNavDrawerSide(value as ThemeNavDrawerSide)}
              className="mt-2 flex flex-wrap gap-2"
            >
              <ToggleGroupItem
                value="left"
                variant={settings.navDrawerSide === "left" ? "default" : "outline"}
              >
                <ArrowLeft className="h-4 w-4" /> {t("theme_customizer.mobile_drawer.left")}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="right"
                variant={settings.navDrawerSide === "right" ? "default" : "outline"}
              >
                <ArrowRight className="h-4 w-4" /> {t("theme_customizer.mobile_drawer.right")}
              </ToggleGroupItem>
            </ToggleGroup>
          </ThemeSection>
        </div>

        <aside className={cn(variant === "page" && "lg:sticky lg:top-4 lg:self-start")}>
          <ThemePreview />
        </aside>
      </div>
    </div>
  );
}

function RadiusTokenGroup({
  value,
  onChange,
}: {
  value: ThemeRadiusToken;
  onChange: (value: ThemeRadiusToken) => void;
}) {
  const { t } = useTranslation();

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next as ThemeRadiusToken)}
      className="mt-2 flex flex-wrap gap-2"
    >
      {THEME_RADIUS_TOKENS.map((token) => (
        <ToggleGroupItem key={token} value={token} variant={value === token ? "default" : "outline"}>
          {token === "match" ? t("theme_customizer.appearance.match") : token}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export default function ThemeSettings() {
  return <ThemeSettingsPanel variant="page" />;
}
