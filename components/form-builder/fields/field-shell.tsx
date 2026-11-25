"use client";

import type { ReactNode } from "react";
import { Control, FieldValues, useFormContext } from "react-hook-form";
import FieldError from "@/components/form/field-error";
import Label from "@/components/label";
import type { LabelProps } from "@/components/form-wrapper/form-builder-type";

type FieldShellProps = {
    /** The form path of the value. The error under the field is looked up by it. */
    name: string;
    label?: LabelProps;
    /** Classes of the box around label, control and error. */
    className?: string;
    /** The id of the control the label points at. Leave out for groups (radio, checkbox). */
    labelFor?: string;
    /** Extra content at the end of the label line, e.g. the "use my location" button. */
    labelSuffix?: ReactNode;
    /** Puts the label in its own box with these classes. */
    labelBoxClassName?: string;
    /** Draw no label even when one is given. A single checkbox draws its own, next to the box. */
    hideLabel?: boolean;
    /** Draw no error text. */
    hideError?: boolean;
    /** Cut a long error message to one line. */
    errorMessageEllipsis?: boolean;
    /** Keep room for one line of error, so the layout does not move when it appears. */
    reserveErrorSpace?: boolean;
    /** The control itself: input, select, calendar button, ... */
    children: ReactNode;
};

/**
 * The frame every field shares: the label above, the control, the error below.
 * A field component draws only its control and hands it to the shell.
 */
export function FieldShell({
    name,
    label,
    className,
    labelFor,
    labelSuffix,
    labelBoxClassName,
    hideLabel = false,
    hideError = false,
    errorMessageEllipsis,
    reserveErrorSpace,
    children,
}: FieldShellProps) {
    const labelNode =
        label && !hideLabel ? <Label htmlFor={labelFor} label={label} suffix={labelSuffix} /> : null;

    return (
        <div className={className}>
            {labelNode && labelBoxClassName !== undefined ? (
                <div className={labelBoxClassName}>{labelNode}</div>
            ) : (
                labelNode
            )}
            {children}
            {!hideError && (
                <FieldError
                    name={name}
                    errorMessageEllipsis={errorMessageEllipsis}
                    reserveSpace={reserveErrorSpace}
                />
            )}
        </div>
    );
}

/**
 * The form `control` a field binds to: the one passed as a prop, or the one of the
 * form the field sits in.
 */
export function useFieldControl(control?: Control<FieldValues>): Control<FieldValues> {
    const { control: formControl } = useFormContext();
    return control ?? formControl;
}
