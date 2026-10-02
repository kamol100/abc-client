import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export type PackageFormType = "client" | "reseller";

type Props = {
  packageType?: PackageFormType;
  lockExceptPrice?: boolean;
};

export const PackageFormFieldSchema = ({
  packageType = "client",
  lockExceptPrice = false,
}: Props = {}): FieldConfig[] => {
  const isReseller = packageType === "reseller";
  const priceFieldName = isReseller ? "buying_price" : "price";

  const fields: FieldConfig[] = [
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
      type: "dropdown",
      name: "mikrotik_profile",
      valueKey: "mikrotik_profile",
      valueMapping: { idKey: "id", labelKey: "name" },
      label: { labelText: "package.mikrotik_profile.label" },
      placeholder: "package.mikrotik_profile.placeholder",
      dependsOn: {
        field: "network_id",
        buildApi: (networkId) => `/dropdown-mikrotik-packages/${networkId}`,
      },
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
      name: priceFieldName,
      label: {
        labelText: "package.price.label",
      },
      placeholder:
        "package.price.placeholder",
    },
    {
      type: "textarea",
      name: "note",
      label: { labelText: "package.note.label" },
      placeholder: "package.note.placeholder",
      rows: 3,
    },
  ];

  if (!lockExceptPrice) return fields;

  return fields.map((field) =>
    field.name === priceFieldName ? field : { ...field, disabled: true }
  );
};

export default PackageFormFieldSchema;
