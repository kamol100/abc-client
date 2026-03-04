import { FieldConfig } from "../form-wrapper/form-builder-type";

export const UnitTypeFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: "unit_type.name.label",
                mandatory: true,
            },
            placeholder: "unit_type.name.placeholder",
        },
    ];
};

export default UnitTypeFormFieldSchema;
