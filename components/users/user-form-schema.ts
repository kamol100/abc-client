import { FieldConfig } from "../form-wrapper/form-builder-type";

type Props = {
    mode: "create" | "edit";
};

export const UserFormSchema = ({ mode = "create" }: Props): FieldConfig[] => {
    const user_form_schema: FieldConfig[] = [
        {
            type: "text",
            name: "name",
            label: {
                labelText: "user.name.label",
                mandatory: true,
                tooltip: "user.name.tooltip",
            },
            placeholder: "user.name.placeholder",
        },
        {
            type: "text",
            label: {
                labelText: "user.username.label",
                mandatory: true,
            },
            name: "username",
            placeholder: "user.username.placeholder",
        },
        {
            type: "text",
            label: {
                labelText: "user.email.label",
                mandatory: true,
            },
            name: "email",
            placeholder: "user.email.placeholder",
        },
        {
            type: "dropdown",
            label: {
                labelText: "user.roles.label",
                mandatory: true,
            },
            name: "roles_id",
            placeholder: "user.roles.placeholder",
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
                labelText: "user.password.label",
                mandatory: true,
            },
            name: "password",
            placeholder: "user.password.placeholder",
            permission: mode === "create",
        },
        {
            type: "text",
            label: {
                labelText: "user.confirm_password.label",
                mandatory: true,
            },
            name: "confirm",
            placeholder: "user.confirm_password.placeholder",
            permission: mode === "create",
        },
        {
            type: "dropdown",
            label: {
                labelText: "user.status.label",
                mandatory: true,
            },
            name: "status",
            placeholder: "user.status.placeholder",
            options: [
                { value: 1, label: "common.active" },
                { value: 0, label: "common.inactive" },
            ],
        },
    ];

    return user_form_schema;
};

export default UserFormSchema;
