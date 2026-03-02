import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

export const SubZoneFormFieldSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "dropdown",
            name: "zone_id",
            label: { labelText: t("sub_zone.zone.label"), mandatory: true },
            placeholder: t("sub_zone.zone.placeholder"),
            api: "/dropdown-zones",
            valueKey: "zone",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "network_id",
            label: { labelText: t("sub_zone.network.label") },
            placeholder: t("sub_zone.network.placeholder"),
            api: "/dropdown-networks",
            valueKey: "network",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "text",
            name: "name",
            label: { labelText: t("sub_zone.name.label"), mandatory: true },
            placeholder: t("sub_zone.name.placeholder"),
        },
        {
            type: "text",
            name: "name_bn",
            label: { labelText: t("sub_zone.name_bn.label") },
            placeholder: t("sub_zone.name_bn.placeholder"),
        },
        {
            type: "text",
            name: "location",
            label: { labelText: t("sub_zone.location.label") },
            placeholder: t("sub_zone.location.placeholder"),
        },
        {
            type: "text",
            name: "ports",
            label: { labelText: t("sub_zone.ports.label") },
            placeholder: t("sub_zone.ports.placeholder"),
        },
        {
            type: "textarea",
            name: "note",
            label: { labelText: t("sub_zone.note.label") },
            placeholder: t("sub_zone.note.placeholder"),
            rows: 3,
        },
    ];
};

export default SubZoneFormFieldSchema;
