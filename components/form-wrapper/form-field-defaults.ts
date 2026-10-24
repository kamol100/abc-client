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

const FIELD_ARRAY_ALIASES: Record<string, string[]> = {
    items_label: ["label"],
    deductions_label: ["label"],
    items_value: ["value"],
    deductions_value: ["value"],
};

export const isBlankFieldArrayValue = (value: unknown): boolean => {
    if (value == null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (typeof value === "number") return value === 0;
    return false;
};

const readFieldArrayValue = (record: Record<string, unknown>, name: string): unknown => {
    if (!isBlankFieldArrayValue(record[name])) return record[name];
    for (const alias of FIELD_ARRAY_ALIASES[name] ?? []) {
        if (!isBlankFieldArrayValue(record[alias])) return record[alias];
    }
    return record[name];
};

export const normalizeFieldArrayItems = (
    items: unknown[],
    itemFields: FieldConfig[],
    options?: { omitBlank?: boolean },
): Record<string, unknown>[] =>
    items.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = { ...(item as Record<string, unknown>) };
        for (const field of itemFields) {
            record[field.name] = readFieldArrayValue(record, field.name);
        }
        const isBlank = itemFields.every((field) => isBlankFieldArrayValue(record[field.name]));
        if (options?.omitBlank && isBlank) return [];
        return [record];
    });

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
