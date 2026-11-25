import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { LabelProps } from "@/components/form-builder/types";
import { FieldShell, useFieldControl, useFieldId } from "@/components/form-builder/fields/field-shell";

type RadioOption = {
    label: string;
    value: string | number;
    disabled?: boolean;
};

type RadioFieldProps = {
    name: string;
    label?: LabelProps;
    options: RadioOption[];
    className?: string;
    direction?: "row" | "col";
    defaultValue?: string | number;
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
};

const RadioField: React.FC<RadioFieldProps> = ({
    name,
    label,
    options,
    className,
    direction = "col",
    defaultValue,
    control: controlProp,
    rules,
}) => {
    const { t } = useTranslation();
    const control = useFieldControl(controlProp);
    const id = useFieldId(name);

    return (
        <FieldShell name={name} label={label} className={cn("flex flex-col gap-1", className)}>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange }, fieldState: { error: fieldError } }) => (
                    <RadioGroup
                        value={value == null ? undefined : String(value)}
                        onValueChange={onChange}
                        defaultValue={defaultValue == null ? undefined : String(defaultValue)}
                        className={cn(
                            "flex gap-4",
                            direction === "col" ? "flex-col" : "flex-row",
                            fieldError && "border-destructive rounded-md p-2"
                        )}
                    >
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value={String(opt.value)}
                                    id={`${id}-${opt.value}`}
                                    disabled={opt.disabled}
                                    className={cn(
                                        fieldError && "border-destructive",
                                        "focus:ring-2 focus:ring-ring"
                                    )}
                                />
                                <label
                                    htmlFor={`${id}-${opt.value}`}
                                    className={cn(
                                        "text-sm text-foreground cursor-pointer",
                                        opt.disabled && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {t(opt.label)}
                                </label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            />
        </FieldShell>
    );
};

export default RadioField;
