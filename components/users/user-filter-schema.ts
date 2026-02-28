import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const UserFilterSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    const user_filter_schema: FieldConfig[] = [
        {
            type: "text",
            name: "username",
            placeholder: t("username"),
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "email",
            placeholder: t("email"),
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "roles_id",
            placeholder: t("roles"),
            permission: true,
            api: "/dropdown-roles",
        },
        {
            type: "dropdown",
            name: "status",
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