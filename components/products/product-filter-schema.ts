import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ProductFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "any",
            placeholder: "product.any_search.placeholder",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "product_category_id",
            placeholder: "product.product_category.placeholder",
            permission: true,
            api: "/dropdown-product-categories",
        },
        {
            type: "dropdown",
            name: "unit_type_id",
            placeholder: "product.unit_type.placeholder",
            permission: true,
            api: "/dropdown-unit-types",
        },
        {
            type: "dropdown",
            name: "has_serial",
            placeholder: "product.has_serial.placeholder",
            permission: true,
            options: [
                { value: "1", label: "common.yes" },
                { value: "0", label: "common.no" },
            ],
        },
    ];
};

export default ProductFilterSchema;
