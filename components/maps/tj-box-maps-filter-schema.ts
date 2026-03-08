import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const TjBoxMapsFilterSchema = (): FieldConfig[] => [
  {
    type: "text",
    name: "name",
    placeholder: "tj_box_map.filter.name",
    watchForFilter: true,
  },
  {
    type: "text",
    name: "address",
    placeholder: "tj_box_map.filter.address",
    watchForFilter: true,
  },
  {
    type: "dropdown",
    name: "device_id",
    placeholder: "tj_box_map.filter.device",
    api: "/dropdown-devices",
  },
  {
    type: "dropdown",
    name: "zone_id",
    placeholder: "tj_box_map.filter.zone",
    api: "/dropdown-zones",
  },
  {
    type: "dropdown",
    name: "status",
    placeholder: "tj_box_map.filter.status",
    options: [
      { value: "active", label: "tj_box_map.status.active" },
      { value: "inactive", label: "tj_box_map.status.inactive" },
    ],
  },
];

export default TjBoxMapsFilterSchema;
