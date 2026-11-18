"use client";

import { MyButton } from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { ThemeSettingsPanel } from "@/components/settings/themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ThemeCustomize() {
  const { t } = useTranslation();

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

export function ThemeSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      title="theme_customizer.menu"
      description="theme_customizer.description"
      showFooter={false}
      size="md"
    >
      <ThemeSettingsPanel variant="popover" />
    </MyDialog>
  );
}
