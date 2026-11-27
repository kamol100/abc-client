"use client";

/**
 * Shows one section from registry/sections.ts: as a settings page (with its
 * heading) or inside a ⚙ dialog (`inDialog`, the dialog shows the heading).
 *
 * This file only lays things out. Values come from core/values.ts, saving from
 * core/use-save-setting.ts, controls from setting-controls.tsx.
 */

import type { ReactNode } from "react";
import { Info, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePermissions, useSettings } from "@/context/app-provider";
import { cn } from "@/lib/utils";
import { useSmsGatewayStatus } from "@/components/sms-sent/sms-gateway";
import { isSmsSendingSetting, smsSettingsLocked } from "@/components/sms-sent/sms-gateway-status";
import { readSetting } from "@/components/settings/core/values";
import { useSaveSetting } from "@/components/settings/core/use-save-setting";
import { visibleSettingKeys } from "@/components/settings/core/visibility";
import type { SettingInfoPart } from "@/components/settings/registry/define";
import { fieldOf, settingLabelKey, type SettingKey } from "@/components/settings/registry/fields";
import { SECTIONS, type SectionName, type SettingsSection } from "@/components/settings/registry/sections";
import { SettingControl } from "@/components/settings/ui/setting-controls";

type SettingsPanelProps = {
  section: SectionName;
  inDialog?: boolean;
};

export function SettingsPanel({ section, inDialog = false }: SettingsPanelProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { hasPermission } = usePermissions();
  const { save, isSaving } = useSaveSetting();
  const config: SettingsSection = SECTIONS[section];
  const smsLock = useSmsLock(config.guard === "sms-gateway");

  const valueOf = (key: SettingKey) => readSetting(key, settings[key]);
  const groups = config.groups
    .map((group) => ({ ...group, keys: visibleSettingKeys(group.keys, { hasPermission, valueOf }) }))
    .filter((group) => group.keys.length > 0);

  return (
    <div className={cn("flex w-full flex-col gap-6", !inDialog && "max-w-3xl")}>
      {!inDialog && (
        <header>
          <h1 className="text-base font-semibold sm:text-lg">{t(config.title)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(config.description)}</p>
        </header>
      )}

      {smsLock.banner}

      {groups.length === 0 && config.emptyText && (
        <Card className="p-4 text-sm text-muted-foreground">{t(config.emptyText)}</Card>
      )}

      {groups.map((group, index) => (
        <section key={group.title ?? index} className="flex flex-col gap-2">
          {group.title && <h2 className="px-1 text-sm font-medium text-muted-foreground">{t(group.title)}</h2>}
          <Card className="divide-y divide-border">
            {group.keys.map((key) => (
              <SettingRow key={key} settingKey={key}>
                <SettingControl
                  field={fieldOf(key)}
                  settingKey={key}
                  value={valueOf(key)}
                  saving={isSaving(key)}
                  disabled={smsLock.locks(key)}
                  save={(next) => save(key, next)}
                />
              </SettingRow>
            ))}
          </Card>
        </section>
      ))}
    </div>
  );
}

/** Label (+ optional help line) on the left, control on the right. Stacks on phones. */
function SettingRow({ settingKey, children }: { settingKey: SettingKey; children: ReactNode }) {
  const { t } = useTranslation();
  const { description, info } = fieldOf(settingKey);
  const label = t(settingLabelKey(settingKey));
  return (
    <div
      data-setting={settingKey}
      className="flex min-h-14 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium">{label}</p>
          {info && <SettingInfo label={label} parts={info} />}
        </div>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{t(description)}</p>}
      </div>
      <div className="flex min-w-0 justify-end">{children}</div>
    </div>
  );
}

/** Info button next to a label; the explanation opens in a popover. */
function SettingInfo({ label, parts }: { label: string; parts: SettingInfoPart[] }) {
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <MyButton
          type="button"
          variant="ghost"
          size="icon"
          icon={false}
          className="size-6 shrink-0 text-muted-foreground"
          aria-label={t("settings.actions.about", { label })}
        >
          <Info className="size-4" aria-hidden />
        </MyButton>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="flex max-h-[--radix-popover-content-available-height] w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 overflow-y-auto text-sm"
      >
        <p className="font-semibold">{label}</p>
        {parts.map((part) => (
          <div key={part.title}>
            <p className="font-medium">{t(part.title)}</p>
            <p className="mt-0.5 text-muted-foreground">{t(part.text)}</p>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/** SMS sending switches stay locked until an SMS gateway is active. */
function useSmsLock(enabled: boolean) {
  const { t } = useTranslation();
  const gateway = useSmsGatewayStatus(enabled);
  const locked = enabled && (gateway.isLoading || smsSettingsLocked(gateway.status));
  const showBanner = enabled && !gateway.isLoading && smsSettingsLocked(gateway.status);

  return {
    locks: (key: SettingKey) => locked && isSmsSendingSetting(key),
    banner: showBanner ? (
      <div className="flex flex-col gap-3 rounded-md border border-yellow-600/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">{t("sms_sent.gateway.settings_notice")}</p>
        <MyButton
          action="edit"
          type="button"
          url="/sms-send"
          title={t("sms_sent.gateway.configure")}
          className="border-yellow-600/40 text-yellow-700 hover:bg-yellow-600/10 hover:text-yellow-700 dark:border-yellow-400/40 dark:text-yellow-400 dark:hover:bg-yellow-400/10 dark:hover:text-yellow-400"
        >
          <TriangleAlert className="size-4" aria-hidden />
          {t("sms_sent.gateway.configure")}
        </MyButton>
      </div>
    ) : null,
  };
}
