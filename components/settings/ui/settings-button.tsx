"use client";

/**
 * The ⚙ button on list pages. Opens a section from registry/sections.ts in a dialog.
 *
 *   <SettingsButton section="clients" />
 *   <PrefixSettingsButton field="invoice_prefix" />
 */

import { Settings } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { usePermissions } from "@/context/app-provider";
import { cn } from "@/lib/utils";
import { SECTIONS, type PrefixKey, type SectionName } from "@/components/settings/registry/sections";
import { SettingsPanel } from "@/components/settings/ui/settings-panel";

type SettingsButtonProps = {
  section: SectionName;
  size?: "icon" | "default";
  className?: string;
};

export function SettingsButton({ section, size = "icon", className }: SettingsButtonProps) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(false);
  const { title, description } = SECTIONS[section];

  if (!hasPermission("company-settings.access")) return null;

  return (
    <>
      <MyButton
        type="button"
        size={size}
        variant="outline"
        className={cn(size === "icon" && "h-9 w-9 shrink-0", className)}
        tooltip={title}
        aria-label={t(title)}
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4" />
      </MyButton>
      <MyDialog open={open} onOpenChange={setOpen} size="2xl" title={title} description={description}>
        <SettingsPanel section={section} inDialog />
      </MyDialog>
    </>
  );
}

/** ⚙ for one ID prefix, on the list that uses it. */
export function PrefixSettingsButton({ field }: { field: PrefixKey }) {
  return <SettingsButton section={field} />;
}
