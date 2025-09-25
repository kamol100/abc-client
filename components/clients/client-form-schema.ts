import { useTranslation } from "react-i18next";
import { AccordionFormBuilderType } from "../form-wrapper/form-builder-type";

type props = {
    mode: string
}

export const UserFormSchema = (): AccordionFormBuilderType[] => {
    const { t } = useTranslation();

    return [

        {
            name: "test",
            form: [

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
                    permission: true,
                },
                {
                    type: "text",
                    label: t('confirm_password'),
                    name: "confirm",
                    placeholder: t("confirm_password"),
                    permission: true,
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
            ]
        },
        {
            name: "test2",
            form: [

                {
                    type: "text",
                    label: t('confirm_password'),
                    name: "confirm",
                    placeholder: t("confirm_password"),
                    permission: true,
                },
            ]
        }


    ];


};
export default UserFormSchema;