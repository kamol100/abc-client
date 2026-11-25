"use client";

import { useEffect, useRef } from "react";
import { get, useFormContext, useWatch } from "react-hook-form";
import { sameFormValue } from "@/components/form-builder/core/compare";
import { resolveFieldPath } from "@/components/form-builder/core/conditions";
import type { FieldChangeEffect } from "@/components/form-wrapper/form-builder-type";

type FieldChangeEffectProps = {
    /** Full form path of the field being watched. */
    name: string;
    /** The path of the row the field sits in (`items.2`), or "" at the top level. */
    namePrefix: string;
    effect: FieldChangeEffect;
};

/**
 * Carries out a field's `onChange` effect: when the user changes the field, writes
 * the given values into other fields. It draws nothing.
 *
 * It does not fire when the form itself is filled (on open, or when an edit record
 * arrives), because then the other fields hold values that belong to the new value.
 */
export function FieldChangeEffectRunner({ name, namePrefix, effect }: FieldChangeEffectProps) {
    const { getValues, setValue, formState } = useFormContext();
    const { defaultValues } = formState;
    const value = useWatch({ name });
    const previousValue = useRef(value);

    useEffect(() => {
        const previous = previousValue.current;
        previousValue.current = value;
        if (sameFormValue(previous, value)) return;

        const targets = Object.entries(effect.set).map(
            ([target, next]) => [resolveFieldPath(namePrefix, target), next] as const,
        );

        // The form was just filled: this field and its targets all hold the values
        // they were filled with, so they belong together.
        const filledTogether =
            sameFormValue(value, get(defaultValues, name)) &&
            targets.every(([path]) => sameFormValue(getValues(path), get(defaultValues, path)));
        if (filledTogether) return;

        targets.forEach(([path, next]) => {
            if (sameFormValue(getValues(path), next)) return;
            setValue(path, next, { shouldDirty: true, shouldValidate: false });
        });
    }, [value, name, namePrefix, effect, defaultValues, getValues, setValue]);

    return null;
}
