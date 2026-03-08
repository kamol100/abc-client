import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function MikrotikPackageFilterSchema(): FieldConfig[] {
  return [
    {
      type: "dropdown",
      name: "network_id",
      label: { labelText: "mikrotik_package.network.label" },
      placeholder: "mikrotik_package.network.placeholder",
      api: "/dropdown-networks",
    },
  ];
}

export default MikrotikPackageFilterSchema;
