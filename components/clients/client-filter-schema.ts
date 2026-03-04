import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientFilterSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "pppoe_username",
            placeholder: t("client.pppoe_username.placeholder"),
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "name",
            placeholder: t("client.name.placeholder"),
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "phone",
            placeholder: t("client.phone.placeholder"),
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "network_id",
            placeholder: t("client.network.placeholder"),
            permission: true,
            api: "/dropdown-networks",
        },
        {
            type: "dropdown",
            name: "zone_id",
            placeholder: t("client.zone.placeholder"),
            permission: true,
            api: "/dropdown-zones",
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: t("client.status.placeholder"),
            permission: true,
            options: [
                { value: 1, label: t("common.active") },
                { value: 0, label: t("common.inactive") },
            ],
        },
    ];
};

export default ClientFilterSchema;
