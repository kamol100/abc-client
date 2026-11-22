"use client";

/**
 * The one way to save a company setting.
 *
 * Sends `{ settings: { [key]: value } }` to POST /company/settings, updates the
 * settings already loaded in the app, and shows the "updated" message. On
 * failure the API error is shown by useApiMutation and `save` returns false,
 * so the caller can put the old value back.
 */

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSettings } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { SettingsPayloadSchema, toPayload, type SettingsPayload } from "@/components/settings/core/values";
import { isSettingKey } from "@/components/settings/registry/fields";

type SaveOptions = {
  /** Show "Setting updated" after a successful save. Default true. */
  notify?: boolean;
};

export function useSaveSetting({ notify = true }: SaveOptions = {}) {
  const { t } = useTranslation();
  const { updateSettings } = useSettings();
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());
  const { mutateAsync } = useApiMutation<unknown, SettingsPayload>({
    url: "/company/settings",
    method: "POST",
    invalidateKeys: "settings",
  });

  /**
   * Saves one setting. `key` is a registry key (value converted by its kind) or,
   * for settings outside the registry such as notification switches, a raw key
   * whose value is sent as given.
   */
  const save = useCallback(
    async (key: string, value: unknown): Promise<boolean> => {
      const apiValue = isSettingKey(key) ? toPayload(key, value) : (value as string | number | null);
      const payload = SettingsPayloadSchema.parse({ settings: { [key]: apiValue } });

      setSaving((previous) => new Set(previous).add(key));
      try {
        await mutateAsync(payload);
        updateSettings({ [key]: apiValue });
        if (notify) toast.success(t("settings.messages.updated"));
        return true;
      } catch {
        return false;
      } finally {
        setSaving((previous) => {
          const next = new Set(previous);
          next.delete(key);
          return next;
        });
      }
    },
    [mutateAsync, notify, t, updateSettings],
  );

  return { save, isSaving: (key: string) => saving.has(key) };
}
