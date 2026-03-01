import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import Label from "../label";
import { Input } from "../ui/input";
import type { LabelProps } from "../form-wrapper/form-builder-type";
import FieldError from "./field-error";

type InputFieldProps = {
    name: string;
    label?: LabelProps;
    placeholder?: string;
    type?: string;
    className?: string;
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
};

const InputField: React.FC<InputFieldProps> = ({
    name,
    label,
    placeholder,
    type = "text",
    className,
    control: controlProp,
    rules,
}) => {
    const { control: ctxControl } = useFormContext();
    const control = controlProp ?? ctxControl;

    return (
        <div className={cn("flex flex-col gap-1 data-[state=error]:text-destructive", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
                    <Input
                        id={name}
                        placeholder={placeholder}
                        type={type}
                        value={value ?? ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        className={cn(error && "border-destructive dark:border-destructive")}
                    />
                )}
            />
            <FieldError name={name} />
        </div>
    );
};

export default InputField;
