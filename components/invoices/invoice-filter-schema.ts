import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const InvoiceFilterSchema = (): FieldConfig[] => [
    {
        type: "text",
        name: "track_id",
        placeholder: "invoice.filter.track_id",
        watchForFilter: true,
    },
    {
        type: "dateRange",
        name: "create_date",
        placeholder: "invoice.filter.create_date",
    },
    {
        type: "dateRange",
        name: "due_date",
        placeholder: "invoice.filter.due_date",
    },
    {
        type: "dropdown",
        name: "zone_id",
        placeholder: "invoice.filter.zone",
        api: "/dropdown-zones",
    },
    {
        type: "dropdown",
        name: "invoice_type_id",
        placeholder: "invoice.filter.type",
        api: "/dropdown-invoice-types",
    },
    {
        type: "dropdown",
        name: "create_by",
        placeholder: "invoice.filter.created_by",
        api: "/dropdown-staffs",
    },
    {
        type: "dropdown",
        name: "client_id",
        placeholder: "invoice.filter.client",
        api: "/dropdown-clients",
    },
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

export default InvoiceFilterSchema;
