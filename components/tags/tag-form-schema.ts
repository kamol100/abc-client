import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const TagFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("tag.name.label"),
                mandatory: true,
            },
            placeholder: t("tag.name.placeholder"),
        },
    ];
};

export default TagFormFieldSchema;
