import { FieldConfig } from "../form-wrapper/form-builder-type";

export const CompanyFormFieldSchema = (mode: "create" | "edit"): FieldConfig[] => {
    const base = [
        {
            type: "text" as const,
            name: "name",
            label: { labelText: "company.name.label", mandatory: true },
            placeholder: "company.name.placeholder",
        },
        {
            type: "text" as const,
            name: "phone",
            label: { labelText: "company.phone.label", mandatory: true },
            placeholder: "company.phone.placeholder",
        },
        {
            type: "text" as const,
            name: "domain",
            label: { labelText: "company.domain.label", mandatory: true },
            placeholder: "company.domain.placeholder",
        },
        {
            type: "email" as const,
            name: "email",
            label: { labelText: "company.email.label" },
            placeholder: "company.email.placeholder",
        },
        {
            type: "dropdown" as const,
            name: "status",
            label: { labelText: "company.status.label", mandatory: true },
            placeholder: "company.status.placeholder",
            options: [
                { value: "active", label: "common.active" },
                { value: "inactive", label: "common.inactive" },
            ],
        },
        {
            type: "textarea" as const,
            name: "address",
            label: { labelText: "company.address.label" },
            placeholder: "company.address.placeholder",
            rows: 2,
        },
    ];

    if (mode === "create") {
        return [
            ...base,
            {
                type: "text" as const,
                name: "username",
                label: { labelText: "company.username.label", mandatory: true },
                placeholder: "company.username.placeholder",
            },
            {
                type: "password" as const,
                name: "password",
                label: { labelText: "company.password.label", mandatory: true },
                placeholder: "company.password.placeholder",
            },
            {
                type: "password" as const,
                name: "confirm",
                label: { labelText: "company.confirm_password.label", mandatory: true },
                placeholder: "company.confirm_password.placeholder",
            },
        ];
    }

    return base;
};

export default CompanyFormFieldSchema;
