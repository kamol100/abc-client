import { FieldConfig } from "../form-wrapper/form-builder-type";

export const TableFormSchema = (): FieldConfig[] => {
    const schema: FieldConfig[] = [
        {
            type: "switch",
            name: "show_table_header",
            label: { labelText: "show_table_header" },
            permission: true,
            saveOnChange: true,
        },
    ];

    return schema;
};

export default TableFormSchema;
