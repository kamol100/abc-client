import { useTranslation } from "react-i18next";

type props = {
    mode: string
}

export const UserFilterSchema = () => {
    const { t } = useTranslation();

    const user_filter_schema = [
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


    return user_filter_schema;

};
export default UserFilterSchema;