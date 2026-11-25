import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form";
import { Switch as ShadcnSwitch } from "../ui/switch";
import type { LabelProps } from "../form-wrapper/form-builder-type";
import { FieldShell, useFieldControl, useFieldId } from "@/components/form-builder/fields/field-shell";

type SwitchProps = {
    name: string;
    label?: LabelProps;
    className?: string;
    onValueChange?: (value: boolean) => void;
    disabled?: boolean;
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
};

const Switch: React.FC<SwitchProps> = ({
    name,
    label,
    className,
    onValueChange,
    disabled = false,
    control: controlProp,
    rules,
}) => {
    const control = useFieldControl(controlProp);
    const id = `switch-${useFieldId(name)}`;

    return (
        <FieldShell
            name={name}
            label={label}
            labelFor={id}
            hideError
            className={cn("flex flex-row gap-1", className)}
        >
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange } }) => (
                    <ShadcnSwitch
                        id={id}
                        checked={!!value}
                        disabled={disabled}
                        onCheckedChange={(checked) => {
                            onChange(checked);
                            onValueChange?.(checked);
                        }}
                    />
                )}
            />
        </FieldShell>
    );
};

export default Switch;
