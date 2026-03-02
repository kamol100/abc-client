import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const ZoneFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("zone.name.label"),
                mandatory: true,
            },
            placeholder: t("zone.name.placeholder"),
        },
        {
            type: "number",
            name: "lat",
            label: {
                labelText: t("zone.latitude.label"),
            },
            placeholder: t("zone.latitude.placeholder"),
        },
        {
            type: "number",
            name: "lon",
            label: {
                labelText: t("zone.longitude.label"),
            },
            placeholder: t("zone.longitude.placeholder"),
        },
    ];
};

export default ZoneFormFieldSchema;
