import { FieldConfig } from "../form-wrapper/form-builder-type";

export const ProductCategoryFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: "product_category.name.label",
                mandatory: true,
            },
            placeholder: "product_category.name.placeholder",
        },
        {
            type: "textarea",
            name: "description",
            label: {
                labelText: "product_category.description.label",
            },
            placeholder: "product_category.description.placeholder",
        },
    ];
};

export default ProductCategoryFormFieldSchema;
