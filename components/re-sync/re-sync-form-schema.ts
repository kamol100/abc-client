import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";

export function ReSyncFormFieldSchema(): FormFieldConfig[] {
  return [
    {
      type: "dropdown",
      name: "network_id",
      label: {
        labelText: "re_sync.sync.network.label",
        mandatory: true,
      },
      placeholder: "re_sync.sync.network.placeholder",
      api: "/dropdown-networks",
    },
  ];
}

export default ReSyncFormFieldSchema;
