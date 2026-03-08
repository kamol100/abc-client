import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

const serialOptions = [
    { label: "common.yes", value: 1 },
    { label: "common.no", value: 0 },
];

export const ProductFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: "product.name.label",
                mandatory: true,
            },
            placeholder: "product.name.placeholder",
        },
        {
            type: "radio",
            name: "has_serial",
            label: {
                labelText: "product.has_serial.label",
                mandatory: true,
            },
            options: serialOptions,
            direction: "row",
            defaultValue: "0",
        },
        {
            type: "number",
            name: "vat",
            label: {
                labelText: "product.vat.label",
            },
            placeholder: "product.vat.placeholder",
        },
        {
            type: "dropdown",
            name: "unit_type_id",
            api: "/dropdown-unit-types",
            isClearable: false,
            label: {
                labelText: "product.unit_type.label",
                mandatory: true,
            },
            placeholder: "product.unit_type.placeholder",
        },
        {
            type: "dropdown",
            name: "product_category_id",
            api: "/dropdown-product-categories",
            isClearable: false,
            label: {
                labelText: "product.product_category.label",
                mandatory: true,
            },
            placeholder: "product.product_category.placeholder",
        },
        {
            type: "textarea",
            name: "description",
            label: {
                labelText: "product.description.label",
            },
            placeholder: "product.description.placeholder",
            rows: 2,
        },
    ];
};

export default ProductFormFieldSchema;
