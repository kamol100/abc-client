import { useTranslation } from "react-i18next";
import { FormBuilderType } from "../form-wrapper/form-builder-type";

type props = {
    mode: string
}

export const UserFormSchema = ({ mode = "create" }: props): FormBuilderType[] => {
    const { t } = useTranslation();

    const user_form_schema = [
        {
            type: "text",
            name: "name",
            label: t('name'),
            placeholder: t('name'),
            mandatory: true,
            tooltip: t('name_tooltip'),
            permission: true
        },
        {
            type: "text",
            label: t('username'),
            name: "username",
            placeholder: t("username"),
            permission: true,
        },
        {
            type: "text",
            label: t('email'),
            name: "email",
            placeholder: t("email"),
            permission: true,
        },
        {
            type: "dropdown",
            label: t('roles'),
            name: "roles_id",
            defaultValue: "roles",
            placeholder: t("roles"),
            permission: true,
            api: "/dropdown-roles"
        },
        {
            type: "text",
            label: t('password'),
            name: "password",
            placeholder: t("password"),
            permission: mode === "create",
        },
        {
            type: "text",
            label: t('confirm_password'),
            name: "confirm",
            placeholder: t("confirm_password"),
            permission: mode === "create",
        },
        {
            type: "dropdown",
            label: t('status'),
            name: "status",
            defaultValue: "status",
            placeholder: t("status"),
            permission: true,
            options: [
                { value: 1, label: "Active" },
                { value: 0, label: "Inactive" },
            ]
        },
    ];

    return user_form_schema;

};
export default UserFormSchema;