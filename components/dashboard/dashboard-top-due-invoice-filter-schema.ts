import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const DASHBOARD_TOP_DUE_INVOICE_DEFAULT_LIMIT = 10;

const LIMIT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => ({
  value: String(value),
  label: String(value),
}));

export const DashboardTopDueInvoiceFilterSchema = (): FieldConfig[] => [
  {
    type: "dropdown",
    name: "zone_id",
    placeholder: "dashboard.top_due_invoice.filters.zone",
    api: "/dropdown-zones",
  },
  {
    type: "dropdown",
    name: "limit",
    placeholder: "dashboard.top_due_invoice.filters.limit",
    options: LIMIT_OPTIONS,
  },
];

export default DashboardTopDueInvoiceFilterSchema;
