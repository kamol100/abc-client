"use client";

import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import SettingsForm from "@/components/settings/settings-form";
import {
  SETTINGS_SECTION_SCHEMA,
  type SettingsSectionKey,
} from "@/components/settings/settings-form-schema";
import type { SettingsFieldKey } from "@/components/settings/settings-type";
import { usePermissions } from "@/context/app-provider";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type SettingsSectionButtonProps = {
  section: SettingsSectionKey;
  fields?: readonly SettingsFieldKey[];
  title?: string;
  description?: string;
  size?: "icon" | "default";
  className?: string;
};

export function SettingsSectionButton({
  section,
  fields,
  title,
  description,
  size = "icon",
  className,
}: SettingsSectionButtonProps) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(false);
  const sectionCopy = SETTINGS_SECTION_SCHEMA[section];
  const dialogTitle = title ?? sectionCopy.title;
  const dialogDescription = description ?? sectionCopy.description;

  if (!hasPermission("company-settings.access")) return null;

  return (
    <>
      <MyButton
        type="button"
        size={size}
        variant="outline"
        className={cn(size === "icon" && "h-9 w-9 shrink-0", className)}
        tooltip={dialogTitle}
        aria-label={t(dialogTitle)}
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4" />
      </MyButton>
      <MyDialog
        open={open}
        onOpenChange={setOpen}
        size="2xl"
        title={dialogTitle}
        description={dialogDescription}
      >
        <SettingsForm section={section} fields={fields} embedded />
      </MyDialog>
    </>
  );
}

const PREFIX_FIELDS = [
  "invoice_prefix",
  "pid_prefix",
  "expense_id_prefix",
  "product_code_prefix",
  "ticket_code_prefix",
] as const satisfies readonly SettingsFieldKey[];

type PrefixFieldKey = (typeof PREFIX_FIELDS)[number];

export function PrefixSettingsButton({ field }: { field: PrefixFieldKey }) {
  const fields = useMemo(() => [field], [field]);

  return (
    <SettingsSectionButton
      section="general"
      fields={fields}
      title={`settings.fields.${field}.label`}
      description="settings.common.prefix_description"
    />
  );
}
