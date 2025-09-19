import { useTranslation } from "react-i18next";

type props = {
    mode: string
}

export const ClientFilterSchema = () => {
    const { t } = useTranslation();

    const client_filter_schema = [
        {
            type: "text",
            label: t("username"),
            name: "username",
            placeholder: t("username"),
            permission: true,
        },
        {
            type: "text",
            label: t("email"),
            name: "email",
            placeholder: t("email"),
            permission: true,
        },
        {
            type: "dropdown",
            name: "roles_id",
            defaultValue: "roles",
            placeholder: t("roles"),
            permission: true,
            api: "/dropdown-roles",
        },
        {
            type: "dropdown",
            name: "status",
            defaultValue: "status",
            placeholder: t("status"),
            permission: true,
            options: [
                { value: 1, label: "Active" },
                { value: 0, label: "Inactive" },
            ],
        },
    ]


    return client_filter_schema;

};
export default ClientFilterSchema;