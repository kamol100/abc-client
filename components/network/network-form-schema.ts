import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

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
      type: "dropdown",
      name: "status",
      label: { labelText: "network.status.label", mandatory: true },
      placeholder: "network.status.placeholder",
      options: [
        { value: 1, label: "common.active" },
        { value: 0, label: "common.inactive" },
      ],
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
