import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

/**
 * Filters of the staff collection list. `any` matches the invoice ID, the note or the
 * collected amount; the dates are each one day of the invoice.
 */
export const DashboardStaffCollectionFilterSchema = (): FieldConfig[] => [
  {
    type: "text",
    name: "any",
    placeholder: "dashboard.staff_collection.filters.any",
    watchForFilter: true,
  },
  {
    type: "date",
    name: "create_date",
    placeholder: "invoice.filter.create_date",
  },
  {
    type: "date",
    name: "due_date",
    placeholder: "invoice.filter.due_date",
  },
  {
    type: "dropdown",
    name: "client_id",
    placeholder: "invoice.filter.client",
    api: "/dropdown-clients",
  },
  {
    type: "dropdown",
    name: "invoice_type_id",
    placeholder: "invoice.filter.type",
    api: "/dropdown-invoice-types",
  },
];

export default DashboardStaffCollectionFilterSchema;
