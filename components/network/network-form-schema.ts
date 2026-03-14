import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

const toggleOptions = [
  { label: "common.yes", value: 1 },
  { label: "common.no", value: 0 },
];

export const NetworkFormFieldSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "name",
      label: { labelText: "network.name.label", mandatory: true },
      placeholder: "network.name.placeholder",
    },
    {
      type: "text",
      name: "ip_address",
      label: { labelText: "network.ip_address.label", mandatory: true },
      placeholder: "network.ip_address.placeholder",
    },
    {
      type: "text",
      name: "mikrotik_user",
      label: { labelText: "network.mikrotik_user.label", mandatory: true },
      placeholder: "network.mikrotik_user.placeholder",
    },
    {
      type: "text",
      name: "mikrotik_password",
      label: { labelText: "network.mikrotik_password.label" },
      placeholder: "network.mikrotik_password.placeholder",
    },
    {
      type: "text",
      name: "web_port",
      label: { labelText: "network.web_port.label" },
      placeholder: "network.web_port.placeholder",
    },
    {
      type: "radio",
      name: "auto_client_mikrotik_status",
      label: { labelText: "network.auto_client_mikrotik_status.label" },
      direction: "row",
      defaultValue: "0",
      options: toggleOptions,
    },
    {
      type: "radio",
      name: "auto_sync_status",
      label: { labelText: "network.auto_sync_status.label" },
      direction: "row",
      defaultValue: "0",
      options: toggleOptions,
    },
    {
      type: "radio",
      name: "graph_status",
      label: { labelText: "network.graph_status.label" },
      direction: "row",
      defaultValue: "0",
      options: toggleOptions,
    },
    {
      type: "textarea",
      name: "notes",
      label: { labelText: "network.notes.label" },
      placeholder: "network.notes.placeholder",
      rows: 3,
      className: "sm:col-span-2",
    },
  ];
};

export default NetworkFormFieldSchema;
