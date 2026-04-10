import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const DASHBOARD_ZONE_WISE_TOP_DUE_INVOICE_DEFAULT_LIMIT = 10;

const LIMIT_OPTIONS = [10, 20, 30, 40, 50].map((value) => ({
  value: String(value),
  label: String(value),
}));

export const DashboardZoneWiseTopInvoiceDueFilterSchema = (): FieldConfig[] => [
  {
    type: "dropdown",
    name: "limit",
    placeholder: "dashboard.zone_wise_top_invoice_due.filters.limit",
    options: LIMIT_OPTIONS,
  },
];

export default DashboardZoneWiseTopInvoiceDueFilterSchema;
