import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import Label from "../label";
import { Switch as ShadcnSwitch } from "../ui/switch";
import type { LabelProps } from "../form-wrapper/form-builder-type";

type SwitchProps = {
    name: string;
    label?: LabelProps;
    className?: string;
    onValueChange?: (value: boolean) => void;
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
};

const Switch: React.FC<SwitchProps> = ({
    name,
    label,
    className,
    onValueChange,
    control: controlProp,
    rules,
}) => {
    const { control: ctxControl } = useFormContext();
    const control = controlProp ?? ctxControl;

    return (
        <div className={cn("flex flex-row gap-1", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange } }) => (
                    <ShadcnSwitch
                        id={`switch-${name}`}
                        checked={!!value}
                        onCheckedChange={(checked) => {
                            onChange(checked);
                            onValueChange?.(checked);
                        }}
                    />
                )}
            />
        </div>
    );
};

export default Switch;
