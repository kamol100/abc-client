import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientInvoiceFilterSchema = (): FieldConfig[] => [
  {
    type: "dropdown",
    name: "status",
    placeholder: "invoice.filter.status",
    options: [
      { value: "due", label: "invoice.filter.status_due" },
      { value: "paid", label: "invoice.filter.status_paid" },
      { value: "partial", label: "invoice.filter.status_partial" },
    ],
  },
];

export default ClientInvoiceFilterSchema;
