import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function MikrotikPackageFilterSchema(): FieldConfig[] {
  return [
    {
      type: "dropdown",
      name: "network_id",
      placeholder: "mikrotik_package.network.placeholder",
      api: "/dropdown-networks",
    },
  ];
}

export default MikrotikPackageFilterSchema;
