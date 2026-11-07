import { Control, Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { LabelProps } from "@/components/form-wrapper/form-builder-type";
import FieldError from "@/components/form/field-error";
import Label from "@/components/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type InputFieldProps = {
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
    /** Optional focus handler (e.g. for scrolling input into view on mobile) */
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    labelSuffix?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
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
    onFocus,
    labelSuffix,
    prefix,
    suffix,
}) => {
    const { control: ctxControl } = useFormContext();
    const control = controlProp ?? ctxControl;
    const { t } = useTranslation();
    return (
        <div className={cn("flex flex-col gap-1 data-[state=error]:text-destructive", className)}>
            {label && <Label label={label} suffix={labelSuffix} />}
            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue={defaultValue}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => {
                    const input = (
                        <Input
                            id={name}
                            placeholder={placeholder ? t(placeholder as string) : ""}
                            type={type}
                            value={readOnly ? defaultValue ?? value ?? "" : value ?? ""}
                            onChange={onChange}
                            onBlur={onBlur}
                            onFocus={onFocus}
                            ref={ref}
                            readOnly={readOnly}
                            disabled={disabled}
                            className={cn(
                                error && "border-destructive dark:border-destructive",
                                prefix && "pl-9",
                                suffix && "pr-9"
                            )}
                        />
                    );

                    if (!prefix && !suffix) {
                        return input;
                    }

                    return (
                        <div className="relative">
                            {prefix ? (
                                <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                    {prefix}
                                </div>
                            ) : null}
                            {input}
                            {suffix ? (
                                <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-2 text-muted-foreground">
                                    {suffix}
                                </div>
                            ) : null}
                        </div>
                    );
                }}
            />
            <FieldError name={name} errorMessageEllipsis={errorMessageEllipsis} reserveSpace={reserveErrorSpace} />
        </div>
    );
};

export default InputField;
