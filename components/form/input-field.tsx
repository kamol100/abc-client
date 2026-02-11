import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
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
};

const InputField: React.FC<InputFieldProps> = ({
    name,
    label,
    placeholder,
    type = "text",
    className,
}) => {
    const { control, formState: { errors } } = useFormContext();

    return (
        <div className={cn("flex flex-col gap-1 data-[state=error]:text-destructive dark:data-[state=error]:text-destructive dark:bg-gray-900", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                render={({ field: { value, onChange, onBlur, ref } }) => (
                    <Input
                        id={name}
                        placeholder={placeholder}
                        type={type}
                        value={value ?? ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        className={cn(errors[name] && "border-destructive dark:border-destructive")}
                    />
                )}
            />
            <FieldError name={name} />
        </div>
    );
};

export default InputField;
