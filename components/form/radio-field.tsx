import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Label from "../label";
import type { LabelProps } from "../form-wrapper/form-builder-type";
import FieldError from "./field-error";

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
    defaultValue?: string;
};

const RadioField: React.FC<RadioFieldProps> = ({
    name,
    label,
    options,
    className,
    direction = "col",
    defaultValue,
}) => {
    const { t } = useTranslation();
    const { control, formState: { errors } } = useFormContext();

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                render={({ field: { value, onChange } }) => (
                    <RadioGroup
                        value={value}
                        onValueChange={onChange}
                        defaultValue={defaultValue}
                        className={cn(
                            "flex gap-4",
                            direction === "col" ? "flex-col" : "flex-row",
                            errors[name] && "border-destructive rounded-md p-2"
                        )}
                    >
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value={String(opt.value)}
                                    id={`${name}-${opt.value}`}
                                    disabled={opt.disabled}
                                    className={cn(
                                        errors[name] && "border-destructive",
                                        "focus:ring-2 focus:ring-ring"
                                    )}
                                />
                                <label
                                    htmlFor={`${name}-${opt.value}`}
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
            <FieldError name={name} />
        </div>
    );
};

export default RadioField;
