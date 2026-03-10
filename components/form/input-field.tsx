import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import Label from "../label";
import { Input } from "../ui/input";
import type { LabelProps } from "../form-wrapper/form-builder-type";
import FieldError from "./field-error";
import { useTranslation } from "react-i18next";

type InputFieldProps = {
    name: string;
    label?: LabelProps;
    placeholder?: string;
    type?: string;
    className?: string;
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
    readOnly?: boolean;
    disabled?: boolean;
    defaultValue?: string | number;
    errorMessageEllipsis?: boolean;
    /** Reserve space for error message so layout (e.g. grid rows) does not shift when validation errors appear */
    reserveErrorSpace?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
    name,
    label,
    placeholder,
    type = "text",
    className,
    control: controlProp,
    rules,
    readOnly = false,
    disabled = false,
    defaultValue,
    errorMessageEllipsis = false,
    reserveErrorSpace = false,
}) => {
    const { control: ctxControl } = useFormContext();
    const control = controlProp ?? ctxControl;
    const { t } = useTranslation();
    return (
        <div className={cn("flex flex-col gap-1 data-[state=error]:text-destructive", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue={defaultValue}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
                    <Input
                        id={name}
                        placeholder={placeholder ? t(placeholder as string) : ""}
                        type={type}
                        value={readOnly ? defaultValue ?? value ?? "" : value ?? ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        readOnly={readOnly}
                        disabled={disabled}
                        className={cn(error && "border-destructive dark:border-destructive")}
                    />
                )}
            />
            <FieldError name={name} errorMessageEllipsis={errorMessageEllipsis} reserveSpace={reserveErrorSpace} />
        </div>
    );
};

export default InputField;
