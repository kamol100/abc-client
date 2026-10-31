"use client";

import { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TELEGRAM_STATUS } from "@/components/telegram/telegram-type";

export function TelegramFilterSchema(): FieldConfig[] {
  return [
    {
      type: "text",
      name: "name",
      placeholder: "telegram.name.placeholder",
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: "telegram.status.placeholder",
      options: TELEGRAM_STATUS.map((status) => ({
        value: status,
        label: `telegram.status.options.${status}`,
      })),
    },
  ];
}
