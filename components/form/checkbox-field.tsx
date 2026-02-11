import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import Label from "../label";
import type { LabelProps } from "../form-wrapper/form-builder-type";
import FieldError from "./field-error";

type CheckboxOption = {
    label: string;
    value: string | number;
    disabled?: boolean;
};

type CheckboxFieldProps = {
    name: string;
    label?: LabelProps;
    options?: CheckboxOption[];
    className?: string;
    direction?: "row" | "col";
    single?: boolean;
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({
    name,
    label,
    options,
    className,
    direction = "col",
    single = false,
}) => {
    const { control, formState: { errors } } = useFormContext();

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {!single && label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                render={({ field: { value, onChange } }) => {
                    if (single) {
                        return (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={name}
                                    checked={!!value}
                                    onCheckedChange={onChange}
                                    className={cn(errors[name] && "border-destructive")}
                                />
                                <label htmlFor={name} className="text-sm text-foreground cursor-pointer">
                                    {label?.labelText}
                                </label>
                            </div>
                        );
                    }

                    return (
                        <div className={cn(
                            "flex gap-4",
                            direction === "col" ? "flex-col" : "flex-row",
                            errors[name] && "border-destructive rounded-md p-2"
                        )}>
                            {options?.map((opt, idx) => {
                                const checked = Array.isArray(value) ? value.includes(opt.value) : false;
                                return (
                                    <div key={idx} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${name}-${opt.value}`}
                                            checked={checked}
                                            onCheckedChange={(isChecked) => {
                                                if (isChecked) {
                                                    onChange([...(value || []), opt.value]);
                                                } else {
                                                    onChange((value || []).filter((v: string | number) => v !== opt.value));
                                                }
                                            }}
                                            disabled={opt.disabled}
                                            className={cn(errors[name] && "border-destructive")}
                                        />
                                        <label
                                            htmlFor={`${name}-${opt.value}`}
                                            className={cn(
                                                "text-sm text-foreground cursor-pointer",
                                                opt.disabled && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {opt.label}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
            />
            <FieldError name={name} />
        </div>
    );
};

export default CheckboxField;
