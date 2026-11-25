"use client";

import { createContext, useContext, type ReactNode } from "react";
import { Control, FieldValues, useFormContext } from "react-hook-form";
import FieldError from "@/components/form/field-error";
import Label from "@/components/label";
import type { LabelProps } from "@/components/form-wrapper/form-builder-type";

/** Settings one form gives to all of its fields. */
export type FieldOptions = {
    /**
     * Put in front of every field id (`{idPrefix}-{name}`). A field id is normally just
     * the field name, so two forms on one page that share a field name need a prefix
     * on one of them to keep ids unique.
     */
    idPrefix?: string;
    /** Keep room for one line of error under every field, so fields never move. */
    reserveErrorSpace?: boolean;
};

export const FieldOptionsContext = createContext<FieldOptions>({});

export const FieldOptionsProvider = FieldOptionsContext.Provider;

/** The DOM id of the field with this form path. The field name, unless the form sets a prefix. */
export function useFieldId(name: string): string {
    const { idPrefix } = useContext(FieldOptionsContext);
    return idPrefix ? `${idPrefix}-${name}` : name;
}

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
    /**
     * Keep room for one line of error, so the layout does not move when it appears.
     * When left out, the form's own setting is used.
     */
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
    const formOptions = useContext(FieldOptionsContext);
    const reserveSpace = reserveErrorSpace ?? formOptions.reserveErrorSpace;

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
                    reserveSpace={reserveSpace}
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
