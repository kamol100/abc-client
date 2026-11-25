import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import type { LabelProps } from "../form-wrapper/form-builder-type";
import { useTranslation } from "react-i18next";
import { FieldShell, useFieldControl } from "@/components/form-builder/fields/field-shell";

type TextareaFieldProps = {
    name: string;
    label?: LabelProps;
    placeholder?: string;
    className?: string;
    rows?: number;
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
    disabled?: boolean;
};

const TextareaField: React.FC<TextareaFieldProps> = ({
    name,
    label,
    placeholder,
    className,
    rows = 4,
    control: controlProp,
    rules,
    disabled = false,
}) => {
    const control = useFieldControl(controlProp);
    const { t } = useTranslation();
    return (
        <FieldShell
            name={name}
            label={label}
            labelFor={name}
            className={cn("flex flex-col gap-1 data-[state=error]:text-destructive dark:data-[state=error]:text-destructive", className)}
        >
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
                    <Textarea
                        id={name}
                        placeholder={placeholder ? t(placeholder as string) : ""}
                        value={value ?? ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        rows={rows}
                        disabled={disabled}
                        className={cn(error && "border-destructive dark:border-destructive")}
                    />
                )}
            />
        </FieldShell>
    );
};

export default TextareaField;
