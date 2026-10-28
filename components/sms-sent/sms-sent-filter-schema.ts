import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const SmsSentFilterSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "any",
      placeholder: "client.any_search.placeholder",
      permission: true,
    },
    {
      type: "dropdown",
      name: "network_id",
      placeholder: "client.network.placeholder",
      permission: true,
      api: "/dropdown-networks",
      isClearable: true,
    },
    {
      type: "dropdown",
      name: "zone_id",
      placeholder: "client.zone.placeholder",
      permission: true,
      api: "/dropdown-zones",
      isClearable: true,
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: "client.status.placeholder",
      permission: true,
      isClearable: false,
      options: [
        { value: "all", label: "common.all" },
        { value: 1, label: "common.active" },
        { value: 0, label: "common.inactive" },
      ],
    },
  ];
};

export default SmsSentFilterSchema;
