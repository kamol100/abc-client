import { Close } from "@/components/icon";
import InputField from "@/components/form/input-field";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { TextFieldConfig } from "@/components/form-wrapper/form-builder-type";

type InputConfig = TextFieldConfig & { type: "text" | "email" | "number" | "tel" };

/**
 * One-line inputs: text, email, number, and tel (a Bangladeshi mobile number; the
 * input itself removes a typed +88 on blur). In a filter they get a clear button
 * once they hold a value.
 */
export const textField = defineField<InputConfig>({
    types: ["text", "email", "number", "tel"],
    isTextInput: true,
    render: ({ field, name }) => (
        <InputField
            name={name}
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
            disabled={field.disabled}
            readOnly={field.readOnly}
            errorMessageEllipsis={field.errorEllipsis}
        />
    ),
    renderFilter: ({ field, value, onClear }) => (
        <div className="relative">
            <InputField
                name={field.name}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
            />
            {value ? (
                <button
                    type="button"
                    className="absolute top-1 right-0 cursor-pointer p-2 text-muted-foreground hover:text-foreground"
                    onClick={() => onClear(field.name)}
                >
                    <Close />
                </button>
            ) : null}
        </div>
    ),
});
