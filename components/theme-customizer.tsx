"use client";

import { MyButton } from "@/components/my-button";
import { ThemeSettingsPanel } from "@/components/settings/themes";
import { ThemeStudio } from "@/components/themes/theme-studio";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * The theme button in the top bar.
 * staff: opens the full-page theme screen (saved, shareable themes on the account).
 * device: the subscriber portal, whose users are not staff, keeps the panel that saves
 * on this device only.
 */
export default function ThemeCustomize({ scope = "staff" }: { scope?: "staff" | "device" }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const trigger = (
    <MyButton
      variant="outline"
      size="icon"
      aria-label={t("theme_customizer.aria_label")}
      onClick={scope === "staff" ? () => setOpen(true) : undefined}
    >
      <SlidersHorizontal className="h-4 w-4" />
    </MyButton>
  );

  if (scope === "staff") {
    return (
      <>
        {trigger}
        <ThemeStudio open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="max-h-[min(70vh,40rem)] w-[22.5rem] overflow-y-auto p-4">
        <h4 className="font-medium">{t("theme_customizer.title")}</h4>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("theme_customizer.description")}
        </p>
        <ThemeSettingsPanel variant="popover" />
      </PopoverContent>
    </Popover>
  );
}

/** The "Theme settings" menu item (user menu, company and reseller profile): the same full-page theme screen. */
export function ThemeSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return <ThemeStudio open={open} onOpenChange={onOpenChange} />;
}
