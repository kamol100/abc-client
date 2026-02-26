"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeSettings } from "@/context/theme-data-provider";

const THEME_COLOR_OPTIONS: { name: ThemeColor; label: string; primary: string }[] = [
  { name: "zinc", label: "Zinc", primary: "240 5.9% 10%" },
  { name: "rose", label: "Rose", primary: "346.8 77.2% 49.8%" },
  { name: "red", label: "Red", primary: "0 84.2% 60.2%" },
  { name: "blue", label: "Blue", primary: "221.2 83.2% 53.3%" },
  { name: "green", label: "Green", primary: "142.1 76.2% 36.3%" },
  { name: "orange", label: "Orange", primary: "24.6 95% 53.1%" },
];

export function ThemeColorToggle() {
  const { settings, setColor } = useThemeSettings();

  return (
    <Select
      onValueChange={(value) => setColor(value as ThemeColor)}
      defaultValue={settings.color}
    >
      <SelectTrigger className="w-[180px] ring-offset-transparent focus:ring-transparent">
        <SelectValue placeholder="Select Color" />
      </SelectTrigger>
      <SelectContent className="border-muted">
        {THEME_COLOR_OPTIONS.map(({ name, label, primary }) => (
          <SelectItem key={name} value={name}>
            <div className="flex item-center space-x-3">
              <div
                className="rounded-full w-[20px] h-[20px]"
                style={{ backgroundColor: `hsl(${primary})` }}
              />
              <div className="text-sm">{label}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
