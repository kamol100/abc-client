import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const SubscriptionPlanFormFieldSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "name",
      label: { labelText: "subscription.plan.name", mandatory: true },
      placeholder: "subscription.plan.name",
    },
    {
      type: "textarea",
      name: "description",
      label: { labelText: "subscription.plan.description" },
      placeholder: "subscription.plan.description",
    },
    {
      type: "number",
      name: "price",
      label: { labelText: "subscription.plan.price", mandatory: true },
      placeholder: "subscription.plan.price",
    },
    {
      type: "dropdown",
      name: "billing_interval",
      label: { labelText: "subscription.plan.interval", mandatory: true },
      placeholder: "subscription.plan.interval",
      options: [
        { label: "subscription.interval.month", value: "month" },
        { label: "subscription.interval.year", value: "year" },
      ],
    },
    {
      type: "number",
      name: "min_clients",
      label: { labelText: "subscription.plan.min_clients" },
      placeholder: "subscription.plan.min_clients",
    },
    {
      type: "number",
      name: "max_clients",
      label: { labelText: "subscription.plan.max_clients" },
      placeholder: "subscription.plan.max_clients",
    },
    {
      type: "switch",
      name: "is_active",
      label: { labelText: "subscription.plan.active" },
    },
  ];
};

export default SubscriptionPlanFormFieldSchema;
