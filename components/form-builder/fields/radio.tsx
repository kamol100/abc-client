import RadioField from "@/components/form/radio-field";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { RadioFieldConfig } from "@/components/form-builder/types";

/** One choice out of a short list. */
export const radioField = defineField<RadioFieldConfig>({
    types: ["radio"],
    render: ({ field, name }) => (
        <RadioField
            name={name}
            label={field.label}
            direction={field.direction}
            defaultValue={field.defaultValue}
            options={field.options}
        />
    ),
});
