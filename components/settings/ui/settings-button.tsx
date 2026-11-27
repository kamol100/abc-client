"use client";

/**
 * The ⚙ button on list pages. Opens a section from registry/sections.ts in a dialog.
 *
 *   <SettingsButton section="sms" />
 *
 * List pages get theirs from the table toolbar (`page` in the toolbar config).
 */

import { Settings } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { usePermissions } from "@/context/app-provider";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SECTIONS, permittedGroups, type SectionName } from "@/components/settings/registry/sections";

// Loaded when the dialog first opens: every list toolbar has this button, but few open it.
const SettingsPanel = lazy(() =>
  import("@/components/settings/ui/settings-panel").then((mod) => ({ default: mod.SettingsPanel })),
);

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

  // Nothing to show when the user may see none of the section's groups.
  const groups = permittedGroups(section, hasPermission);
  if (!hasPermission("company-settings.access") || groups.length === 0) return null;
  const rows = groups.reduce((count, group) => count + group.keys.length, 0);

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
        <Suspense fallback={<SettingsPanelPlaceholder rows={rows} />}>
          <SettingsPanel section={section} inDialog />
        </Suspense>
      </MyDialog>
    </>
  );
}

/** Same rows as the panel (min-h-14 each), so the dialog keeps its height when the panel arrives. */
function SettingsPanelPlaceholder({ rows }: { rows: number }) {
  return (
    <Card className="divide-y divide-border" aria-hidden>
      {Array.from({ length: Math.max(1, rows) }, (_, index) => (
        <div key={index} className="flex min-h-14 items-center justify-between gap-6 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-56" />
        </div>
      ))}
    </Card>
  );
}
