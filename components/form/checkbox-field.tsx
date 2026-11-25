import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form";
import type { LabelProps } from "@/components/form-builder/types";
import { useTranslation } from "react-i18next";
import { FieldShell, useFieldControl, useFieldId } from "@/components/form-builder/fields/field-shell";

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
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({
    name,
    label,
    options,
    className,
    direction = "col",
    single = false,
    control: controlProp,
    rules,
}) => {
    const control = useFieldControl(controlProp);
    const id = useFieldId(name);
    const { t } = useTranslation();
    return (
        <FieldShell
            name={name}
            label={label}
            hideLabel={single}
            className={cn("flex flex-col gap-1", className)}
        >
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange }, fieldState: { error: fieldError } }) => {
                    if (single) {
                        return (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={id}
                                    checked={!!value}
                                    onCheckedChange={onChange}
                                    className={cn(fieldError && "border-destructive")}
                                />
                                <label htmlFor={id} className="text-sm text-foreground cursor-pointer">
                                    {label?.labelText ? t(label.labelText) : null}
                                </label>
                            </div>
                        );
                    }

                    return (
                        <div className={cn(
                            "flex gap-4",
                            direction === "col" ? "flex-col" : "flex-row",
                            fieldError && "border-destructive rounded-md p-2"
                        )}>
                            {options?.map((opt, idx) => {
                                const checked = Array.isArray(value) ? value.includes(opt.value) : false;
                                return (
                                    <div key={idx} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${id}-${opt.value}`}
                                            checked={checked}
                                            onCheckedChange={(isChecked) => {
                                                if (isChecked) {
                                                    onChange([...(value || []), opt.value]);
                                                } else {
                                                    onChange((value || []).filter((v: string | number) => v !== opt.value));
                                                }
                                            }}
                                            disabled={opt.disabled}
                                            className={cn(fieldError && "border-destructive")}
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
                                );
                            })}
                        </div>
                    );
                }}
            />
        </FieldShell>
    );
};

export default CheckboxField;
