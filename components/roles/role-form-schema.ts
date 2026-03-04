"use client";

import { FieldConfig } from "../form-wrapper/form-builder-type";

export const RoleFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: "role.name.label",
                mandatory: true,
            },
            placeholder: "role.name.placeholder",
        },
    ];
};

export default RoleFormFieldSchema;
