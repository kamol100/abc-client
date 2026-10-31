"use client";

import { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TELEGRAM_STATUS } from "@/components/telegram/telegram-type";

export function TelegramFormFieldSchema(): FieldConfig[] {
  const statusOptions = TELEGRAM_STATUS.map((status) => ({
    value: status,
    label: `telegram.status.options.${status}`,
  }));

  return [
    {
      type: "text",
      name: "name",
      label: { labelText: "telegram.name.label", mandatory: true },
      placeholder: "telegram.name.placeholder",
    },
    {
      type: "text",
      name: "telegram_channel_id",
      label: {
        labelText: "telegram.telegram_channel_id.label",
        mandatory: true,
      },
      placeholder: "telegram.telegram_channel_id.placeholder",
    },
    {
      type: "dropdown",
      name: "zone_ids",
      label: { labelText: "telegram.zones.label", mandatory: true },
      placeholder: "telegram.zones.placeholder",
      api: "/dropdown-zones",
      isMulti: true,
      valueKey: "zones",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "dropdown",
      name: "status",
      label: { labelText: "telegram.status.label", mandatory: true },
      placeholder: "telegram.status.placeholder",
      options: statusOptions,
      defaultValue: "active",
    },
  ];
}
