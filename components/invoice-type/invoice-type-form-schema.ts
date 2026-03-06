import { FieldConfig } from "../form-wrapper/form-builder-type";

export const InvoiceTypeFormFieldSchema = (): FieldConfig[] => [
    {
        type: "text",
        name: "name",
        label: {
            labelText: "invoice_type.name.label",
            mandatory: true,
        },
        placeholder: "invoice_type.name.placeholder",
    },
    {
        type: "textarea",
        name: "description",
        label: { labelText: "invoice_type.description.label" },
        placeholder: "invoice_type.description.placeholder",
        rows: 2,
    },
];

export default InvoiceTypeFormFieldSchema;
