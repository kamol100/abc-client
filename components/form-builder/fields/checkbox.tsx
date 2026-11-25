import CheckboxField from "@/components/form/checkbox-field";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { CheckboxFieldConfig } from "@/components/form-builder/types";

/** Several choices from a list, or one yes/no box with `single`. */
export const checkboxField = defineField<CheckboxFieldConfig>({
    types: ["checkbox"],
    render: ({ field, name }) => (
        <CheckboxField
            name={name}
            label={field.label}
            options={field.options}
            direction={field.direction}
            single={field.single}
        />
    ),
});
