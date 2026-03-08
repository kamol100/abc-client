import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientMapsFilterSchema = (): FieldConfig[] => [
  {
    type: "dropdown",
    name: "device_id",
    placeholder: "client_map.filter.device",
    api: "/dropdown-devices",
  },
  {
    type: "dropdown",
    name: "network_id",
    placeholder: "client_map.filter.network",
    api: "/dropdown-networks",
  },
  {
    type: "dropdown",
    name: "zone_id",
    placeholder: "client_map.filter.zone",
    api: "/dropdown-zones",
  },
  {
    type: "dropdown",
    name: "status",
    placeholder: "client_map.filter.status",
    options: [
      { value: "1", label: "client_map.status.active" },
      { value: "0", label: "client_map.status.inactive" },
    ],
  },
];

export default ClientMapsFilterSchema;
