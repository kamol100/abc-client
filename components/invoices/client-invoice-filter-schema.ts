import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientInvoiceFilterSchema = (): FieldConfig[] => [
    {
        type: "text",
        name: "track_id",
        placeholder: "invoice.client_history.filters.track_id",
        watchForFilter: true,
    },
    {
        type: "dateRange",
        name: "create_date",
        placeholder: "invoice.client_history.filters.create_date",
    },
    {
        type: "dateRange",
        name: "due_date",
        placeholder: "invoice.client_history.filters.due_date",
    },
    {
        type: "dropdown",
        name: "status",
        placeholder: "invoice.client_history.filters.status",
        options: [
            { value: "due", label: "invoice.filter.status_due" },
            { value: "paid", label: "invoice.filter.status_paid" },
            { value: "partial", label: "invoice.filter.status_partial" },
        ],
    },
];

export default ClientInvoiceFilterSchema;
