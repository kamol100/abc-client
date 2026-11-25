import Switch from "@/components/form/switch";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { SwitchFieldConfig } from "@/components/form-wrapper/form-builder-type";

/** An on/off toggle. With `saveOnChange` the form is saved each time it is flipped. */
export const switchField = defineField<SwitchFieldConfig>({
    types: ["switch"],
    render: ({ field, name, requestSave }) => (
        <div className="flex items-center space-x-2">
            <Switch
                name={name}
                label={field.label}
                onValueChange={field.saveOnChange ? () => requestSave() : undefined}
                rules={field.rules}
                disabled={field.disabled}
            />
        </div>
    ),
});
