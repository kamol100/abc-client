import {
    AccordionSection,
    FieldConfig,
    FormFieldConfig,
} from "@/components/form-wrapper/form-builder-type";

export const flattenFormSchema = (
    formSchema: FormFieldConfig[] | AccordionSection[],
): FormFieldConfig[] => {
    if (!formSchema.length) return [];
    if ("form" in formSchema[0]) {
        return (formSchema as AccordionSection[]).flatMap((section) => section.form);
    }
    return formSchema as FormFieldConfig[];
};

export const flattenFieldConfigs = (
    formSchema: FormFieldConfig[] | AccordionSection[],
): FieldConfig[] => {
    const result: FieldConfig[] = [];
    for (const field of flattenFormSchema(formSchema)) {
        if (field.type === "fieldArray") {
            result.push(...field.itemFields);
        } else if (field.type !== "slot") {
            result.push(field);
        }
    }
    return result;
};

const isEmptyDefaultValue = (value: unknown): boolean =>
    value === undefined || value === null || value === "";

export function applyFormFieldDefaults(
    values: Record<string, unknown> | undefined,
    formSchema: FormFieldConfig[] | AccordionSection[],
    options?: { radios?: boolean },
): Record<string, unknown> {
    const next: Record<string, unknown> = { ...(values ?? {}) };

    for (const field of flattenFieldConfigs(formSchema)) {
        const fillsRadio = options?.radios === true && field.type === "radio";
        if (field.type !== "dropdown" && !fillsRadio) continue;
        if (!("defaultValue" in field) || field.defaultValue == null) continue;
        if (!isEmptyDefaultValue(next[field.name])) continue;
        next[field.name] = field.defaultValue;
    }

    return next;
}
