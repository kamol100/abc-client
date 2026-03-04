import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const UnitTypeFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("unit_type.name.label"),
                mandatory: true,
            },
            placeholder: t("unit_type.name.placeholder"),
        },
    ];
};

export default UnitTypeFormFieldSchema;
