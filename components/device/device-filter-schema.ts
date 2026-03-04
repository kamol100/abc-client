import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const DeviceFilterSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "name",
      placeholder: "device.filters.name",
      permission: true,
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "network_id",
      placeholder: "device.filters.network",
      permission: true,
      api: "/dropdown-networks",
    },
    {
      type: "dropdown",
      name: "device_type_id",
      placeholder: "device.filters.device_type",
      permission: true,
      api: "/dropdown-device-types",
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: "device.filters.status",
      permission: true,
      options: [
        { value: "active", label: "device.status.active" },
        { value: "inactive", label: "device.status.inactive" },
      ],
    },
  ];
};

export default DeviceFilterSchema;
