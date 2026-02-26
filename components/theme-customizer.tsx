"use client";

import { Checked } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { THEME_RADII, useThemeSettings } from "@/context/theme-data-provider";
import { Maximize, Minimize, Moon, Square, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const THEME_COLOR_OPTIONS: { value: ThemeColor; label: string; primary: string }[] = [
  { value: "green", label: "Green", primary: "142.1 76.2% 36.3%" },
  { value: "red", label: "Red", primary: "0 84.2% 60.2%" },
  { value: "zinc", label: "Zinc", primary: "240 5.9% 10%" },
  { value: "rose", label: "Rose", primary: "346.8 77.2% 49.8%" },
  { value: "orange", label: "Orange", primary: "24.6 95% 53.1%" },
  { value: "blue", label: "Blue", primary: "221.2 83.2% 53.3%" },
];

const DENSITY_OPTIONS: { value: ThemeDensity; label: string; icon: typeof Minimize }[] = [
  { value: "compact", label: "Compact", icon: Minimize },
  { value: "comfortable", label: "Comfortable", icon: Square },
  { value: "large", label: "Large", icon: Maximize },
];

export default function ThemeCustomize() {
  const { settings, setColor, setDensity, setRadius } = useThemeSettings();
  const { setTheme, theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Customize</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h4 className="font-medium">Theme Customizer</h4>
        <p className="text-sm text-muted-foreground">Customize your theme.</p>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-sm font-medium">Color</Label>
            <ToggleGroup
              type="single"
              value={settings.color}
              onValueChange={(value) => value && setColor(value as ThemeColor)}
              className="grid grid-cols-3 gap-2 mt-2"
            >
              {THEME_COLOR_OPTIONS.map(({ value, label, primary }) => (
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
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Radius</Label>
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
            <Label className="text-sm font-medium">Density</Label>
            <ToggleGroup
              type="single"
              value={settings.density}
              onValueChange={(value) => value && setDensity(value as ThemeDensity)}
              className="flex gap-2 mt-2 justify-between"
            >
              {DENSITY_OPTIONS.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant={settings.density === value ? "default" : "outline"}
                >
                  <Icon className="h-4 w-4" /> {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Mode</Label>
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
                <Sun className="h-4 w-4" /> Light
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                variant={theme === "dark" ? "default" : "outline"}
              >
                <Moon className="h-4 w-4" /> Dark
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
