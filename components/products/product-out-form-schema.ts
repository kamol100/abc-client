import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ProductOutFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "date",
            name: "out_date",
            label: {
                labelText: "product_out.out_date.label",
            },
            placeholder: "product_out.out_date.placeholder",
        },
        {
            type: "dropdown",
            name: "received_by",
            api: "/dropdown-staffs",
            isClearable: false,
            label: {
                labelText: "product_out.received_by.label",
                mandatory: true,
            },
            placeholder: "product_out.received_by.placeholder",
        },
        {
            type: "dropdown",
            name: "client_id",
            api: "/dropdown-clients",
            label: {
                labelText: "product_out.client.label",
            },
            placeholder: "product_out.client.placeholder",
        },
        {
            type: "switch",
            name: "create_invoice",
            label: {
                labelText: "product_out.create_invoice.label",
            },
        },
        {
            type: "textarea",
            name: "note",
            rows: 2,
            label: {
                labelText: "product_out.note.label",
            },
            placeholder: "product_out.note.placeholder",
        },
    ];
};

export default ProductOutFormFieldSchema;
