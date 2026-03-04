import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const NetworkFilterSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "name",
      placeholder: "network.filters.name",
      permission: true,
      watchForFilter: true,
    },
    {
      type: "text",
      name: "ip_address",
      placeholder: "network.filters.ip_address",
      permission: true,
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: "network.filters.status",
      permission: true,
      options: [
        { value: 1, label: "common.active" },
        { value: 0, label: "common.inactive" },
      ],
    },
  ];
};

export default NetworkFilterSchema;
