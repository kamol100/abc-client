import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import Label from "../label";
import { Textarea } from "../ui/textarea";
import type { LabelProps } from "../form-wrapper/form-builder-type";
import FieldError from "./field-error";

type TextareaFieldProps = {
    name: string;
    label?: LabelProps;
    placeholder?: string;
    className?: string;
    rows?: number;
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
};

const TextareaField: React.FC<TextareaFieldProps> = ({
    name,
    label,
    placeholder,
    className,
    rows = 4,
    control: controlProp,
    rules,
}) => {
    const { control: ctxControl } = useFormContext();
    const control = controlProp ?? ctxControl;

    return (
        <div className={cn("flex flex-col gap-1 data-[state=error]:text-destructive dark:data-[state=error]:text-destructive", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
                    <Textarea
                        id={name}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        rows={rows}
                        className={cn(error && "border-destructive dark:border-destructive")}
                    />
                )}
            />
            <FieldError name={name} />
        </div>
    );
};

export default TextareaField;
