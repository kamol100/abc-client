import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const SubZoneFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "dropdown",
            name: "zone_id",
            label: {
                labelText: t("zone"),
                mandatory: true,
            },
            placeholder: t("zone"),
            api: "/dropdown-zones",
            valueKey: "zone",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "network_id",
            label: {
                labelText: t("network"),
            },
            placeholder: t("network"),
            api: "/dropdown-networks",
            valueKey: "network",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("sub_zone_name_en"),
                mandatory: true,
            },
            placeholder: t("sub_zone_name_en"),
        },
        {
            type: "text",
            name: "name_bn",
            label: {
                labelText: t("sub_zone_name_bn"),
            },
            placeholder: t("sub_zone_name_bn"),
        },
        {
            type: "text",
            name: "location",
            label: {
                labelText: t("location"),
            },
            placeholder: t("location"),
        },
        {
            type: "text",
            name: "ports",
            label: {
                labelText: t("ports"),
            },
            placeholder: t("ports"),
        },
        {
            type: "textarea",
            name: "note",
            label: {
                labelText: t("note"),
            },
            placeholder: t("note"),
            rows: 3,
        },
    ];
};

export default SubZoneFormFieldSchema;
