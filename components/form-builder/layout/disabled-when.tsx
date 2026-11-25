"use client";

import type { ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { isRulePassing, resolveFieldPath } from "@/components/form-builder/core/conditions";
import type { DisabledWhen, FieldConfig } from "@/components/form-wrapper/form-builder-type";

type DisabledWhenFieldProps = {
    field: FieldConfig;
    rule: DisabledWhen;
    /** The path of the row the field sits in (`items.2`), or "" at the top level. */
    namePrefix: string;
    /** Draws the field from the (possibly disabled) config. */
    render: (field: FieldConfig) => ReactNode;
};

/** Draws a field as disabled while its `disabledWhen` rule passes. */
export function DisabledWhenField({ field, rule, namePrefix, render }: DisabledWhenFieldProps) {
    const watched = useWatch({ name: resolveFieldPath(namePrefix, rule.field) });
    const disabled = Boolean(field.disabled) || isRulePassing(rule, watched);

    return <>{render(disabled ? { ...field, disabled: true } : field)}</>;
}
