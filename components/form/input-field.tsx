import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { LabelProps } from "@/components/form-builder/types";
import { Input } from "@/components/ui/input";
import { isBdMobile, normalizeBdMobile } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { FieldShell, useFieldControl, useFieldId } from "@/components/form-builder/fields/field-shell";

export type InputFieldProps = {
    name: string;
    label?: LabelProps;
    placeholder?: string;
    type?: string;
    /** Passed to the input. Use "any" for number fields that accept decimals (meters, prices). */
    step?: string | number;
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
    step,
    className,
    control: controlProp,
    rules,
    readOnly = false,
    disabled = false,
    defaultValue,
    errorMessageEllipsis = false,
    reserveErrorSpace,
    onFocus,
    labelSuffix,
    prefix,
    suffix,
}) => {
    const control = useFieldControl(controlProp);
    const id = useFieldId(name);
    const { t } = useTranslation();
    return (
        <FieldShell
            name={name}
            label={label}
            labelFor={id}
            labelSuffix={labelSuffix}
            className={cn("flex flex-col gap-1 data-[state=error]:text-destructive", className)}
            errorMessageEllipsis={errorMessageEllipsis}
            reserveErrorSpace={reserveErrorSpace}
        >
            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue={defaultValue}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => {
                    const isTel = type === "tel";
                    // A mobile number typed with +88 / 880 shows (and is saved) as 01XXXXXXXXX.
                    const handleBlur = () => {
                        if (isTel && typeof value === "string") {
                            const local = normalizeBdMobile(value);
                            if (isBdMobile(local) && local !== value) onChange(local);
                        }
                        onBlur();
                    };
                    const input = (
                        <Input
                            id={id}
                            placeholder={placeholder ? t(placeholder as string) : ""}
                            type={type}
                            inputMode={isTel ? "tel" : undefined}
                            autoComplete={isTel ? "tel" : undefined}
                            step={step}
                            value={readOnly ? defaultValue ?? value ?? "" : value ?? ""}
                            onChange={onChange}
                            onBlur={handleBlur}
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
        </FieldShell>
    );
};

export default InputField;
