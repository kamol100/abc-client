import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export type PackageFormType = "client" | "reseller";

type Props = {
  packageType?: PackageFormType;
};

export const PackageFormFieldSchema = ({
  packageType = "client",
}: Props = {}): FieldConfig[] => {
  const isReseller = packageType === "reseller";

  return [
    {
      type: "dropdown",
      name: "network_id",
      label: { labelText: "package.network.label", mandatory: true },
      placeholder: "package.network.placeholder",
      api: "/dropdown-networks",
      valueKey: "network",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "text",
      name: "mikrotik_profile",
      label: { labelText: "package.mikrotik_profile.label" },
      placeholder: "package.mikrotik_profile.placeholder",
    },
    {
      type: "text",
      name: "name",
      label: { labelText: "package.name.label", mandatory: true },
      placeholder: "package.name.placeholder",
    },
    {
      type: "text",
      name: "bandwidth",
      label: { labelText: "package.bandwidth.label", mandatory: true },
      placeholder: "package.bandwidth.placeholder",
    },
    {
      type: "number",
      name: "price",
      label: {
        labelText: isReseller ? "package.cost.label" : "package.price.label",
      },
      placeholder: isReseller
        ? "package.cost.placeholder"
        : "package.price.placeholder",
    },
    {
      type: "number",
      name: "buying_price",
      label: {
        labelText: isReseller
          ? "package.reseller_price.label"
          : "package.buying_price.label",
      },
      placeholder: isReseller
        ? "package.reseller_price.placeholder"
        : "package.buying_price.placeholder",
    },
    {
      type: "textarea",
      name: "note",
      label: { labelText: "package.note.label" },
      placeholder: "package.note.placeholder",
      rows: 3,
    },
  ];
};

export default PackageFormFieldSchema;
