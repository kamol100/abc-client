import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";

export function MikrotikPackageFormFieldSchema(): FormFieldConfig[] {
  return [
    {
      type: "dropdown",
      name: "network_id",
      label: { labelText: "mikrotik_package.network.label", mandatory: true },
      placeholder: "mikrotik_package.network.placeholder",
      api: "/dropdown-networks",
      valueKey: "network",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "text",
      name: "name",
      label: { labelText: "mikrotik_package.name.label", mandatory: true },
      placeholder: "mikrotik_package.name.placeholder",
    },
  ];
}

export default MikrotikPackageFormFieldSchema;
