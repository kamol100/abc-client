import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function ImportClientFilterSchema(): FieldConfig[] {
    return [
        {
            type: "text",
            name: "name",
            placeholder: "import_client.filters.name.placeholder",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "service",
            placeholder: "import_client.filters.service.placeholder",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "password",
            placeholder: "import_client.filters.password.placeholder",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "profile",
            placeholder: "import_client.filters.profile.placeholder",
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "disabled",
            placeholder: "import_client.filters.disabled.placeholder",
            options: [
                {
                    value: "true",
                    label: "import_client.filters.disabled.options.true",
                },
                {
                    value: "false",
                    label: "import_client.filters.disabled.options.false",
                },
            ],
        },
        {
            type: "dropdown",
            name: "syncd_status",
            placeholder: "import_client.filters.syncd_status.placeholder",
            options: [
                {
                    value: "imported",
                    label: "import_client.filters.syncd_status.options.imported",
                },
                {
                    value: "null",
                    label: "import_client.filters.syncd_status.options.not_imported",
                },
            ],
        },
    ];
}

export default ImportClientFilterSchema;
