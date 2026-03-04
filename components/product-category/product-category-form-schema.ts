import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const ProductCategoryFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("product_category.name.label"),
                mandatory: true,
            },
            placeholder: t("product_category.name.placeholder"),
        },
        {
            type: "textarea",
            name: "description",
            label: {
                labelText: t("product_category.description.label"),
            },
            placeholder: t("product_category.description.placeholder"),
        },
    ];
};

export default ProductCategoryFormFieldSchema;
