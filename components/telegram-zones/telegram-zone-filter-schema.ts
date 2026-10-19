"use client";

import { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TELEGRAM_ZONE_STATUS } from "@/components/telegram-zones/telegram-zone-type";

export function TelegramZoneFilterSchema(): FieldConfig[] {
  return [
    {
      type: "text",
      name: "name",
      placeholder: "telegram_zone.name.placeholder",
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: "telegram_zone.status.placeholder",
      options: TELEGRAM_ZONE_STATUS.map((status) => ({
        value: status,
        label: `telegram_zone.status.options.${status}`,
      })),
    },
  ];
}
