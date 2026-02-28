import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const ZoneFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("zone_name_en"),
                mandatory: true,
            },
            placeholder: t("zone_name_en"),
        },
        {
            type: "text",
            name: "name_bn",
            label: {
                labelText: t("zone_name_bn"),
            },
            placeholder: t("zone_name_bn"),
        },
        {
            type: "number",
            name: "lat",
            label: {
                labelText: t("latitude"),
            },
            placeholder: t("latitude"),
        },
        {
            type: "number",
            name: "lon",
            label: {
                labelText: t("longitude"),
            },
            placeholder: t("longitude"),
        },
    ];
};

export default ZoneFormFieldSchema;
