import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const NetworkFormFieldSchema = (): FieldConfig[] => {
  const { t } = useTranslation();

  const toggleOptions = [
    { label: t("common.yes"), value: 1 },
    { label: t("common.no"), value: 0 },
  ];

  return [
    {
      type: "text",
      name: "name",
      label: { labelText: t("network.name.label"), mandatory: true },
      placeholder: t("network.name.placeholder"),
    },
    {
      type: "text",
      name: "ip_address",
      label: { labelText: t("network.ip_address.label"), mandatory: true },
      placeholder: t("network.ip_address.placeholder"),
    },
    {
      type: "text",
      name: "mikrotik_user",
      label: { labelText: t("network.mikrotik_user.label"), mandatory: true },
      placeholder: t("network.mikrotik_user.placeholder"),
    },
    {
      type: "password",
      name: "mikrotik_password",
      label: { labelText: t("network.mikrotik_password.label") },
      placeholder: t("network.mikrotik_password.placeholder"),
    },
    {
      type: "text",
      name: "web_port",
      label: { labelText: t("network.web_port.label") },
      placeholder: t("network.web_port.placeholder"),
    },
    {
      type: "radio",
      name: "auto_client_mikrotik_status",
      label: { labelText: t("network.auto_client_mikrotik_status.label") },
      direction: "row",
      defaultValue: "0",
      options: toggleOptions,
    },
    {
      type: "radio",
      name: "auto_sync_status",
      label: { labelText: t("network.auto_sync_status.label") },
      direction: "row",
      defaultValue: "0",
      options: toggleOptions,
    },
    {
      type: "radio",
      name: "graph_status",
      label: { labelText: t("network.graph_status.label") },
      direction: "row",
      defaultValue: "0",
      options: toggleOptions,
    },
    {
      type: "textarea",
      name: "notes",
      label: { labelText: t("network.notes.label") },
      placeholder: t("network.notes.placeholder"),
      rows: 3,
      className: "sm:col-span-2",
    },
  ];
};

export default NetworkFormFieldSchema;
