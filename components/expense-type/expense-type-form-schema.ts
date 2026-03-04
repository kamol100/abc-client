import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const ExpenseTypeFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("expense_type.name.label"),
                mandatory: true,
            },
            placeholder: t("expense_type.name.placeholder"),
        },
        {
            type: "textarea",
            name: "description",
            label: {
                labelText: t("expense_type.description.label"),
            },
            placeholder: t("expense_type.description.placeholder"),
        },
    ];
};

export default ExpenseTypeFormFieldSchema;
