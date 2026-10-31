"use client";

import { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import type { SettingsSwitchKey } from "@/components/settings/settings-type";
import { TELEGRAM_STATUS } from "@/components/telegram/telegram-type";

export type TelegramNotificationOption = {
  key: SettingsSwitchKey;
  label: string;
};

export type TelegramNotificationGroup = {
  title: string;
  options: TelegramNotificationOption[];
};

export const TELEGRAM_NOTIFICATION_GROUPS: TelegramNotificationGroup[] = [
  {
    title: "telegram.notifications.groups.client",
    options: [
      { key: "telegram_client_create", label: "telegram.notifications.actions.create" },
      { key: "telegram_client_update", label: "telegram.notifications.actions.update" },
      { key: "telegram_client_delete", label: "telegram.notifications.actions.delete" },
    ],
  },
  {
    title: "telegram.notifications.groups.fund_transaction",
    options: [
      {
        key: "telegram_fund_transaction_create",
        label: "telegram.notifications.actions.create",
      },
      {
        key: "telegram_fund_transaction_delete",
        label: "telegram.notifications.actions.delete",
      },
    ],
  },
  {
    title: "telegram.notifications.groups.invoice",
    options: [
      { key: "telegram_invoice_create", label: "telegram.notifications.actions.create" },
      {
        key: "telegram_invoice_auto_generate",
        label: "telegram.notifications.actions.auto_generate",
      },
      { key: "telegram_invoice_update", label: "telegram.notifications.actions.update" },
      { key: "telegram_invoice_paid", label: "telegram.notifications.actions.paid" },
      { key: "telegram_invoice_delete", label: "telegram.notifications.actions.delete" },
    ],
  },
  {
    title: "telegram.notifications.groups.expense",
    options: [
      { key: "telegram_expense_create", label: "telegram.notifications.actions.create" },
      { key: "telegram_expense_update", label: "telegram.notifications.actions.update" },
      { key: "telegram_expense_delete", label: "telegram.notifications.actions.delete" },
    ],
  },
  {
    title: "telegram.notifications.groups.ticket",
    options: [
      { key: "telegram_ticket_create", label: "telegram.notifications.actions.create" },
      { key: "telegram_ticket_update", label: "telegram.notifications.actions.update" },
      { key: "telegram_ticket_delete", label: "telegram.notifications.actions.delete" },
    ],
  },
  {
    title: "telegram.notifications.groups.network",
    options: [
      { key: "telegram_network_create", label: "telegram.notifications.actions.create" },
      { key: "telegram_network_update", label: "telegram.notifications.actions.update" },
      { key: "telegram_network_delete", label: "telegram.notifications.actions.delete" },
    ],
  },
  {
    title: "telegram.notifications.groups.package",
    options: [
      { key: "telegram_package_create", label: "telegram.notifications.actions.create" },
      { key: "telegram_package_update", label: "telegram.notifications.actions.update" },
      { key: "telegram_package_delete", label: "telegram.notifications.actions.delete" },
    ],
  },
  {
    title: "telegram.notifications.groups.vendor",
    options: [
      { key: "telegram_vendor_create", label: "telegram.notifications.actions.create" },
      { key: "telegram_vendor_update", label: "telegram.notifications.actions.update" },
      { key: "telegram_vendor_delete", label: "telegram.notifications.actions.delete" },
    ],
  },
];

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
