"use client";

import { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TELEGRAM_ZONE_STATUS } from "@/components/telegram-zones/telegram-zone-type";

export function TelegramZoneFormFieldSchema(): FieldConfig[] {
  const statusOptions = TELEGRAM_ZONE_STATUS.map((status) => ({
    value: status,
    label: `telegram_zone.status.options.${status}`,
  }));

  return [
    {
      type: "text",
      name: "name",
      label: { labelText: "telegram_zone.name.label", mandatory: true },
      placeholder: "telegram_zone.name.placeholder",
    },
    {
      type: "text",
      name: "telegram_channel_id",
      label: {
        labelText: "telegram_zone.telegram_channel_id.label",
        mandatory: true,
      },
      placeholder: "telegram_zone.telegram_channel_id.placeholder",
    },
    {
      type: "dropdown",
      name: "zone_ids",
      label: { labelText: "telegram_zone.zones.label", mandatory: true },
      placeholder: "telegram_zone.zones.placeholder",
      api: "/dropdown-zones",
      isMulti: true,
      valueKey: "zones",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "dropdown",
      name: "status",
      label: { labelText: "telegram_zone.status.label", mandatory: true },
      placeholder: "telegram_zone.status.placeholder",
      options: statusOptions,
      defaultValue: "active",
    },
  ];
}
