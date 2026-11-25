import { Close } from "@/components/icon";
import InputField from "@/components/form/input-field";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { TextFieldConfig } from "@/components/form-wrapper/form-builder-type";

type InputConfig = TextFieldConfig & { type: "text" | "email" | "number" | "tel" };

const renderInput = ({ field, name }: { field: InputConfig; name: string }) => (
    <InputField
        name={name}
        label={field.label}
        placeholder={field.placeholder}
        type={field.type}
        disabled={field.disabled}
        readOnly={field.readOnly}
    />
);

/** One-line inputs. In a filter they get a clear button once they hold a value. */
export const textField = defineField<TextFieldConfig & { type: "text" | "email" | "number" }>({
    types: ["text", "email", "number"],
    render: renderInput,
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

/** A Bangladeshi mobile number. The input itself removes a typed +88 on blur. */
export const telField = defineField<TextFieldConfig & { type: "tel" }>({
    types: ["tel"],
    render: renderInput,
});
