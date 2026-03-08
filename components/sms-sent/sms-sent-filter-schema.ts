import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const SmsSentFilterSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "pppoe_username",
      label: {
        labelText: "client.pppoe_username.label",
      },
      placeholder: "client.pppoe_username.placeholder",
      watchForFilter: true,
    },
    {
      type: "text",
      name: "name",
      label: {
        labelText: "client.name.label",
      },
      placeholder: "client.name.placeholder",
      watchForFilter: true,
    },
    {
      type: "text",
      name: "phone",
      label: {
        labelText: "client.phone.label",
      },
      placeholder: "client.phone.placeholder",
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "network_id",
      label: {
        labelText: "client.network.label",
      },
      placeholder: "client.network.placeholder",
      api: "/dropdown-networks",
      isClearable: true,
    },
    {
      type: "dropdown",
      name: "zone_id",
      label: {
        labelText: "client.zone.label",
      },
      placeholder: "client.zone.placeholder",
      api: "/dropdown-zones",
      isClearable: true,
    },
  ];
};

export default SmsSentFilterSchema;
