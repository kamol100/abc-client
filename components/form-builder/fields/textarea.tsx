import TextareaField from "@/components/form/textarea-field";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { TextareaFieldConfig } from "@/components/form-builder/types";

/** A multi-line text input. */
export const textareaField = defineField<TextareaFieldConfig>({
    types: ["textarea"],
    render: ({ field, name }) => (
        <TextareaField
            name={name}
            label={field.label}
            placeholder={field.placeholder}
            rows={field.rows}
            disabled={field.disabled}
        />
    ),
});
