import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientFilterSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "username",
            placeholder: t("common.username"),
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "email",
            placeholder: t("common.email"),
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "roles_id",
            placeholder: t("common.roles"),
            permission: true,
            api: "/dropdown-roles",
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: t("common.status"),
            permission: true,
            options: [
                { value: 1, label: t("common.active") },
                { value: 0, label: t("common.inactive") },
            ],
        },
    ];
};

export default ClientFilterSchema;
