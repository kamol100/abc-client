import { useTranslation } from "react-i18next";
import { FieldConfig } from "../form-wrapper/form-builder-type";

type Props = {
    mode: "create" | "edit";
};

export const UserFormSchema = ({ mode = "create" }: Props): FieldConfig[] => {
    const { t } = useTranslation();

    const user_form_schema: FieldConfig[] = [
        {
            type: "text",
            name: "name",
            label: {
                labelText: t("user.name.label"),
                mandatory: true,
                tooltip: t("user.name.tooltip"),
            },
            placeholder: t("user.name.placeholder"),
        },
        {
            type: "text",
            label: {
                labelText: t("user.username.label"),
                mandatory: true,
            },
            name: "username",
            placeholder: t("user.username.placeholder"),
        },
        {
            type: "text",
            label: {
                labelText: t("user.email.label"),
                mandatory: true,
            },
            name: "email",
            placeholder: t("user.email.placeholder"),
        },
        {
            type: "dropdown",
            label: {
                labelText: t("user.roles.label"),
                mandatory: true,
            },
            name: "roles_id",
            placeholder: t("user.roles.placeholder"),
            isMulti: true,
            api: "/dropdown-roles",
            valueKey: "roles",
            valueMapping: {
                idKey: "id",
                labelKey: "name",
            },
        },
        {
            type: "text",
            label: {
                labelText: t("user.password.label"),
                mandatory: true,
            },
            name: "password",
            placeholder: t("user.password.placeholder"),
            permission: mode === "create",
        },
        {
            type: "text",
            label: {
                labelText: t("user.confirm_password.label"),
                mandatory: true,
            },
            name: "confirm",
            placeholder: t("user.confirm_password.placeholder"),
            permission: mode === "create",
        },
        {
            type: "dropdown",
            label: {
                labelText: t("user.status.label"),
                mandatory: true,
            },
            name: "status",
            placeholder: t("user.status.placeholder"),
            options: [
                { value: 1, label: t("common.active") },
                { value: 0, label: t("common.inactive") },
            ],
        },
    ];

    return user_form_schema;
};

export default UserFormSchema;
