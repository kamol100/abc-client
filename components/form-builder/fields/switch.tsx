import Switch from "@/components/form/switch";
import { useFormActions } from "@/components/form-builder/core/form-actions";
import { defineField } from "@/components/form-builder/fields/define-field";
import type { SwitchFieldConfig } from "@/components/form-wrapper/form-builder-type";

function SwitchField({ field, name }: { field: SwitchFieldConfig; name: string }) {
    const { requestSave } = useFormActions();

    return (
        <div className="flex items-center space-x-2">
            <Switch
                name={name}
                label={field.label}
                onValueChange={field.saveOnChange ? requestSave : undefined}
                rules={field.rules}
                disabled={field.disabled}
            />
        </div>
    );
}

/** An on/off toggle. With `saveOnChange` the form is saved each time it is flipped. */
export const switchField = defineField<SwitchFieldConfig>({
    types: ["switch"],
    render: ({ field, name }) => <SwitchField field={field} name={name} />,
});
