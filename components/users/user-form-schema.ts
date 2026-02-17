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
                labelText: t('name'),
                mandatory: true,
                tooltip: t('name_tooltip'),
            },
            placeholder: t('name'),
        },
        {
            type: "text",
            label: {
                labelText: t('username'),
                mandatory: true,
            },
            name: "username",
            placeholder: t("username"),
        },
        {
            type: "text",
            label: {
                labelText: t('email'),
                mandatory: true,
            },
            name: "email",
            placeholder: t("email"),
        },
        {
            type: "dropdown",
            label: {
                labelText: t('roles'),
                mandatory: true,
            },
            name: "roles_id",
            placeholder: t("roles"),
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
                labelText: t('password'),
                mandatory: true,
            },
            name: "password",
            placeholder: t("password"),
            permission: mode === "create",
        },
        {
            type: "text",
            label: {
                labelText: t('confirm_password'),
                mandatory: true,
            },
            name: "confirm",
            placeholder: t("confirm_password"),
            permission: mode === "create",
        },
        {
            type: "dropdown",
            label: {
                labelText: t('status'),
                mandatory: true,
            },
            name: "status",
            placeholder: t("status"),
            options: [
                { value: 1, label: "Active" },
                { value: 0, label: "Inactive" },
            ],
        },
        {
            type: "date",
            name: "joined_at",
            label: { labelText: t("joined_at") ?? "Joined at", mandatory: false },
            placeholder: "Pick a date",
            valueKey: "joined_at",
            dateFormat: "PPP",
        },
        {
            type: "dateRange",
            name: "contract_period",
            label: { labelText: t("contract_period") ?? "Contract period", mandatory: false },
            placeholder: "Pick a date range",
            valueKey: "contract_period",
            dateFormat: "PPP",
        },
    ];

    return user_form_schema;
};

export default UserFormSchema;
