import { FieldConfig } from "../form-wrapper/form-builder-type";

export const DashboardFormSchema = (): FieldConfig[] => {
    const schema: FieldConfig[] = [
        {
            type: "switch",
            name: "show_dashboard_header",
            label: { labelText: "show_dashboard_header" },
            permission: true,
            saveOnChange: true,
        },
    ];

    return schema;
};

export default DashboardFormSchema;
