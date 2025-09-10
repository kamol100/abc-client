"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useThemeContext } from "@/context/theme-data-provider";
import setGlobalColorTheme from "@/lib/theme-colors";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Checked } from "./icon";

export default function ThemeCustomize() {
  const { themeColor, setThemeColor } = useThemeContext();
  const { setTheme, theme } = useTheme();
  const [radius, setRadius] = useState("0.5");
  const [color, setColor] = useState<any>(themeColor ?? "Zinc");
  const bgColor = (color: string) => {
    const value: any = {
      green: 600,
      red: 600,
      zinc: 900,
      rose: 600,
      orange: 500,
      blue: 600,
    };
    return `bg-${color}-${value[color]}`;
  };
  const setBorderColor = (color: string) => {
    return `border-${color}`;
  };
  console.log(themeColor);
  useEffect(() => {
    const setColor = color[0]?.toUpperCase() + color?.slice(1);
    setThemeColor(setColor as ThemeColors);
  }, [color]);

  const updateTheme = async (data: any) => {
    const res = await fetch("/api/theme", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(data);
      setGlobalColorTheme(theme as "light" | "dark", themeColor);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Customize</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h4 className="font-medium">Theme Customizer</h4>
        <p className="text-sm text-muted-foreground">Customize your theme.</p>

        <div className="mt-4">
          <Label className="text-sm font-medium">Color</Label>
          <ToggleGroup
            type="single"
            value={color}
            onValueChange={setColor}
            className="grid grid-cols-3 gap-2 mt-2"
          >
            {["green", "red", "zinc", "rose", "orange", "blue"].map((clr) => (
              <ToggleGroupItem
                key={clr}
                value={clr}
                variant={color === clr ? "default" : "outline"}
                className={
                  clr === themeColor?.toLocaleLowerCase()
                    ? setBorderColor(clr)
                    : ""
                }
              >
                <div
                  className={`${bgColor(
                    clr
                  )} mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full`}
                >
                  {clr === themeColor?.toLocaleLowerCase() && <Checked />}
                </div>
                {clr.charAt(0).toUpperCase() + clr.slice(1)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-4">
          <Label className="text-sm font-medium">Radius</Label>
          <ToggleGroup
            type="single"
            value={radius}
            onValueChange={setRadius}
            className="grid grid-cols-4 gap-2 mt-2"
          >
            {["0", "0.3", "0.5", "0.75", "1.0"].map((radius) => (
              <ToggleGroupItem
                key={radius}
                value={radius}
                variant={radius === radius ? "default" : "outline"}
              >
                <div
                  onClick={() =>
                    updateTheme({
                      target: themeColor,
                      key: "radius",
                      value: `${radius}rem`,
                    })
                  }
                >
                  {radius}
                </div>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-4">
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
              onClick={() => setTheme("light")}
            >
              <Sun className="w-4 h-4 mr-1" /> Light
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dark"
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              <Moon className="w-4 h-4 mr-1" /> Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}
