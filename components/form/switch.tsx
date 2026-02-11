import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import Label from "../label";
import { Switch as ShadcnSwitch } from "../ui/switch";
import type { LabelProps } from "../form-wrapper/form-builder-type";

type SwitchProps = {
    name: string;
    label?: LabelProps;
    className?: string;
    onValueChange?: (value: boolean) => void;
};

const Switch: React.FC<SwitchProps> = ({
    name,
    label,
    className,
    onValueChange,
}) => {
    const { control } = useFormContext();

    return (
        <div className={cn("flex flex-row gap-1", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
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
