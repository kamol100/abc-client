"use client";

import { Checked } from "@/components/icon";
import { MyButton } from "@/components/my-button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { THEME_RADII, useThemeSettings } from "@/context/theme-data-provider";
import type { ThemeColor, ThemeDensity, ThemeNavDrawerSide, ThemeRadius } from "@/types/theme-types";
import {
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  Moon,
  SlidersHorizontal,
  Square,
  Sun,
} from "lucide-react";
import { useTheme } from "@/context/theme-provider";
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

export default function ThemeCustomize() {
  const { t } = useTranslation();
  const { settings, setColor, setDensity, setRadius, setNavDrawerSide } = useThemeSettings();
  const { setTheme, theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <MyButton
          variant="outline"
          size="icon"
          aria-label={t("theme_customizer.aria_label")}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </MyButton>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h4 className="font-medium">{t("theme_customizer.title")}</h4>
        <p className="text-sm text-muted-foreground">
          {t("theme_customizer.description")}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-sm font-medium">
              {t("theme_customizer.color.label")}
            </Label>
            <ToggleGroup
              type="single"
              value={settings.color}
              onValueChange={(value) => value && setColor(value as ThemeColor)}
              className="grid grid-cols-3 gap-2 mt-2"
            >
              {THEME_COLOR_OPTIONS.map(({ value, primary }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.color === value ? "default" : "outline"}
                >
                  <div
                    className="flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full"
                    style={{ backgroundColor: `hsl(${primary})` }}
                  >
                    {settings.color === value && <Checked />}
                  </div>
                  {t(`theme_customizer.color.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t("theme_customizer.radius.label")}
            </Label>
            <ToggleGroup
              type="single"
              value={settings.radius}
              onValueChange={(value) => value && setRadius(value as ThemeRadius)}
              className="grid grid-cols-5 gap-2 mt-2"
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
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t("theme_customizer.density.label")}
            </Label>
            <ToggleGroup
              type="single"
              value={settings.density}
              onValueChange={(value) => value && setDensity(value as ThemeDensity)}
              className="flex gap-2 mt-2 justify-between"
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
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t("theme_customizer.mode.label")}
            </Label>
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={setTheme}
              className="flex gap-2 mt-2 justify-between"
            >
              <ToggleGroupItem
                value="light"
                variant={theme === "light" ? "default" : "outline"}
              >
                <Sun className="h-4 w-4" /> {t("theme_customizer.mode.light")}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                variant={theme === "dark" ? "default" : "outline"}
              >
                <Moon className="h-4 w-4" /> {t("theme_customizer.mode.dark")}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">
              {t("theme_customizer.mobile_drawer.label")}
            </Label>
            <ToggleGroup
              type="single"
              value={settings.navDrawerSide}
              onValueChange={(value) =>
                value && setNavDrawerSide(value as ThemeNavDrawerSide)
              }
              className="flex gap-2 mt-2 justify-between"
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
