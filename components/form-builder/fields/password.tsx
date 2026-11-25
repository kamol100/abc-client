import PasswordField from "@/components/form/password-field";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { TextFieldConfig } from "@/components/form-wrapper/form-builder-type";

/** A password input with a show/hide button. */
export const passwordField = defineField<TextFieldConfig & { type: "password" }>({
    types: ["password"],
    render: ({ field, name }) => (
        <PasswordField
            name={name}
            label={field.label}
            placeholder={field.placeholder}
            disabled={field.disabled}
        />
    ),
});
