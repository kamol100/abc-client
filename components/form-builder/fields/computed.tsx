"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import InputField from "@/components/form/input-field";
import { defineField, type FormFieldProps } from "@/components/form-builder/fields/define-field";
import type { ComputedFieldConfig } from "@/components/form-builder/types";

type Props = FormFieldProps<ComputedFieldConfig>;

/** Works the value out from `row`, keeps the form's copy in step, and shows it. */
function ComputedInput({ field, name, row }: Props & { row: Record<string, unknown> }) {
    const { getValues, setValue } = useFormContext();
    const value = field.compute({ row, getFormValues: getValues });

    // Keep the form's copy in step, so validation and the payload see it.
    useEffect(() => {
        if (Object.is(getValues(name), value)) return;
        setValue(name, value, { shouldDirty: false, shouldValidate: false });
    }, [name, value, getValues, setValue]);

    if (field.display) return <>{field.display(value)}</>;

    return (
        <InputField
            type={field.inputType ?? "number"}
            name={name}
            label={field.label}
            placeholder={field.placeholder}
            readOnly={true}
            defaultValue={value ?? undefined}
        />
    );
}

/** Inside a row: recomputes when a value of that row changes. */
function RowComputedField(props: Props) {
    const row = useWatch({ name: props.namePrefix });
    return <ComputedInput {...props} row={(row ?? {}) as Record<string, unknown>} />;
}

/** At the top level: recomputes when any value of the form changes. */
function FormComputedField(props: Props) {
    const values = useWatch();
    return <ComputedInput {...props} row={(values ?? {}) as Record<string, unknown>} />;
}

/**
 * A read-only value worked out from other fields of the same row (or of the form).
 *
 *   { type: "computed", name: "total", compute: ({ row }) => Number(row.amount) * Number(row.quantity) }
 */
export const computedField = defineField<ComputedFieldConfig>({
    types: ["computed"],
    // Worked out in the browser, so an edit form never needs it from the API.
    sourceKeys: () => [],
    render: (props) =>
        props.namePrefix ? <RowComputedField {...props} /> : <FormComputedField {...props} />,
});
