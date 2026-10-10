import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const FeatureFormFieldSchema = (mode: "create" | "edit" = "create"): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "key",
      label: { labelText: "subscription.feature.key", mandatory: true },
      placeholder: "subscription.feature.key",
      permission: mode === "create",
    },
    {
      type: "text",
      name: "name",
      label: { labelText: "subscription.feature.name", mandatory: true },
      placeholder: "subscription.feature.name",
    },
    {
      type: "textarea",
      name: "description",
      label: { labelText: "subscription.feature.description" },
      placeholder: "subscription.feature.description",
    },
    {
      type: "number",
      name: "sort_order",
      label: { labelText: "subscription.feature.sort_order" },
      placeholder: "subscription.feature.sort_order",
    },
  ];
};

export default FeatureFormFieldSchema;
