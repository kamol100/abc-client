import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientPaymentFilterSchema = (): FieldConfig[] => [
  {
    type: "dateRange",
    name: "payment_date",
    placeholder: "payment.payment_date.label",
  },
  {
    type: "text",
    name: "track_id",
    placeholder: "payment.invoice_id.placeholder",
    watchForFilter: true,
  },
  {
    type: "dropdown",
    name: "status",
    placeholder: "invoice.filter.status",
    options: [
      { value: "paid", label: "invoice.filter.status_paid" },
      { value: "partial_paid", label: "invoice.filter.status_partial" },
      { value: "due", label: "invoice.filter.status_due" },
    ],
  },
];

export default ClientPaymentFilterSchema;
