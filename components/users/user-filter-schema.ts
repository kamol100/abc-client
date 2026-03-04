import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const UserFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "username",
            placeholder: "common.username",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "email",
            placeholder: "common.email",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "roles_id",
            placeholder: "common.roles",
            permission: true,
            api: "/dropdown-roles",
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: "common.status",
            permission: true,
            options: [
                { value: 1, label: "common.active" },
                { value: 0, label: "common.inactive" },
            ],
        },
    ];
};

export default UserFilterSchema;
