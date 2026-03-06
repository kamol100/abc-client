import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const InvoiceFormFieldSchema = (): FieldConfig[] => [
    {
        type: "date",
        name: "create_date",
        label: { labelText: "invoice.create_date.label", mandatory: true },
        placeholder: "invoice.create_date.placeholder",
    },
    {
        type: "date",
        name: "due_date",
        label: { labelText: "invoice.due_date.label", mandatory: true },
        placeholder: "invoice.due_date.placeholder",
    },
    {
        type: "dropdown",
        name: "invoice_type_id",
        label: { labelText: "invoice.invoice_type.label", mandatory: true },
        placeholder: "invoice.invoice_type.placeholder",
        api: "/dropdown-invoice-types",
    },
    {
        type: "dropdown",
        name: "client_id",
        label: { labelText: "invoice.client.label", mandatory: true },
        placeholder: "invoice.client.placeholder",
        api: "/dropdown-clients",
    },
    {
        type: "number",
        name: "discount",
        label: { labelText: "invoice.discount.label" },
        placeholder: "invoice.discount.placeholder",
    },
    {
        type: "dropdown",
        name: "status",
        label: { labelText: "invoice.status.label" },
        placeholder: "invoice.status.placeholder",
        options: [
            { value: "due", label: "invoice.status.due" },
            { value: "paid", label: "invoice.status.paid" },
            { value: "partial_paid", label: "invoice.status.partial_paid" },
        ],
    },
    {
        type: "number",
        name: "partial_amount",
        label: { labelText: "invoice.partial_amount.label" },
        placeholder: "invoice.partial_amount.placeholder",
    },
    {
        type: "dropdown",
        name: "fund_id",
        label: { labelText: "invoice.fund.label" },
        placeholder: "invoice.fund.placeholder",
        api: "/dropdown-funds",
    },
    {
        type: "date",
        name: "payment_date",
        label: { labelText: "invoice.payment_date.label" },
        placeholder: "invoice.payment_date.placeholder",
    },
    {
        type: "radio",
        name: "confirmation_sms",
        label: { labelText: "invoice.confirmation_sms.label" },
        direction: "row",
        defaultValue: "0",
        options: [
            { label: "common.yes", value: 1 },
            { label: "common.no", value: 0 },
        ],
    },
    {
        type: "textarea",
        name: "note",
        label: { labelText: "invoice.note.label" },
        placeholder: "invoice.note.placeholder",
        rows: 2,
    },
];

export default InvoiceFormFieldSchema;
