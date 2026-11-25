/**
 * Turns a record from the API into the values a form starts with.
 *
 *   API record  ->  toFormValues()  ->  applyFormFieldDefaults()  ->  form values
 *
 * The API returns dates as strings and related records as objects (`zone: { id, name }`).
 * The form needs `Date` objects and plain ids (`zone_id: 3`). Pure functions: no React,
 * no form state.
 */
import type {
    FieldArrayConfig,
    FieldConfig,
} from "@/components/form-wrapper/form-builder-type";
import {
    flattenFieldConfigs,
    flattenFormSchema,
    shownFields,
    type FormSchema,
} from "@/components/form-builder/core/form-schema";

type FormValues = Record<string, unknown>;

// --- Dates ---

const parseDateValue = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    return undefined;
};

const parseDateRangeValue = (value: unknown): { from: Date; to?: Date } | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const range = value as { from?: unknown; to?: unknown };
    const from = parseDateValue(range.from);
    if (!from) return undefined;
    return { from, to: parseDateValue(range.to) ?? undefined };
};

// --- One record (the form itself, or one row of a field array) ---

/**
 * Converts the values of `fields` inside `data`. Every key of `data` is kept; a
 * converted value is written under the field name.
 */
const convertFieldValues = (data: FormValues, fields: FieldConfig[]): FormValues => {
    const formValues: FormValues = { ...data };

    fields.forEach((field) => {
        if (field.type === "date") {
            const parsed = parseDateValue(data[field.valueKey ?? field.name]);
            if (parsed) formValues[field.name] = parsed;
        }
        if (field.type === "dateRange") {
            const parsed = parseDateRangeValue(data[field.valueKey ?? field.name]);
            if (parsed) formValues[field.name] = parsed;
        }
        if (field.type === "dropdown") {
            const sourceValue = data[field.valueKey || field.name];
            if (sourceValue === undefined || sourceValue === null) return;

            if (!field.valueMapping) {
                formValues[field.name] = sourceValue;
                return;
            }

            // The API sent the related record (or a list of them): keep only the id.
            const { idKey = "id" } = field.valueMapping;
            if (field.isMulti && Array.isArray(sourceValue)) {
                formValues[field.name] = sourceValue.map((item: unknown) =>
                    typeof item === "object" && item !== null
                        ? (item as FormValues)[idKey]
                        : item,
                );
            } else if (typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
                formValues[field.name] = (sourceValue as FormValues)[idKey];
            } else {
                formValues[field.name] = sourceValue;
            }
        }
    });

    return formValues;
};

// --- Field array rows ---

/**
 * Salary rows are saved as `{ label, value }` but edited as `items_label` / `items_value`
 * (and the same for deductions). Known debt: feature names in shared code.
 */
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

const readFieldArrayValue = (record: FormValues, name: string): unknown => {
    if (!isBlankFieldArrayValue(record[name])) return record[name];
    for (const alias of FIELD_ARRAY_ALIASES[name] ?? []) {
        if (!isBlankFieldArrayValue(record[alias])) return record[alias];
    }
    return record[name];
};

/** Cleans the rows of a field array: drops non-object rows and, when asked, blank rows. */
export const normalizeFieldArrayItems = (
    items: unknown[],
    itemFields: FieldConfig[],
    options?: { omitBlank?: boolean },
): FormValues[] =>
    items.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = { ...(item as FormValues) };
        for (const field of itemFields) {
            record[field.name] = readFieldArrayValue(record, field.name);
        }
        const isBlank = itemFields.every((field) => isBlankFieldArrayValue(record[field.name]));
        if (options?.omitBlank && isBlank) return [];
        return [record];
    });

const fieldArrayRows = (rawRows: unknown, field: FieldArrayConfig): FormValues[] => {
    if (Array.isArray(rawRows)) {
        return normalizeFieldArrayItems(rawRows, field.itemFields, {
            omitBlank: field.omitBlankItems,
        }).map((row) => convertFieldValues(row, field.itemFields));
    }
    const minItems = field.minItems ?? 0;
    return minItems > 0
        ? Array.from({ length: minItems }, () => ({ ...field.defaultItem }))
        : [];
};

// --- The whole form ---

/** An API record as form values: dates parsed, related ids extracted, rows cleaned. */
export const toFormValues = (data: FormValues, formSchema: FormSchema): FormValues => {
    if (!data) return {};

    const staticFields: FieldConfig[] = [];
    const arrayFields: FieldArrayConfig[] = [];
    for (const field of flattenFormSchema(formSchema)) {
        if (field.type === "fieldArray") {
            arrayFields.push(field);
        } else if (field.type !== "slot") {
            staticFields.push(field);
        }
    }

    const formValues = convertFieldValues(data, staticFields);
    for (const field of arrayFields) {
        formValues[field.name] = fieldArrayRows(data[field.name], field);
    }
    return formValues;
};

// --- Defaults ---

const isEmptyDefaultValue = (value: unknown): boolean =>
    value === undefined || value === null || value === "";

/**
 * Fills empty fields with the `defaultValue` from the field config. Dropdown defaults
 * always apply; radio defaults only when `options.radios` is set (create mode).
 */
export function applyFormFieldDefaults(
    values: FormValues | undefined,
    formSchema: FormSchema,
    options?: { radios?: boolean },
): FormValues {
    const next: FormValues = { ...(values ?? {}) };

    for (const field of flattenFieldConfigs(formSchema)) {
        const fillsRadio = options?.radios === true && field.type === "radio";
        if (field.type !== "dropdown" && !fillsRadio) continue;
        if (!("defaultValue" in field) || field.defaultValue == null) continue;
        if (!isEmptyDefaultValue(next[field.name])) continue;
        next[field.name] = field.defaultValue;
    }

    return next;
}

// --- Does the record already hold everything the form shows? ---

/** The key of the API record that a field reads its value from. */
const sourceKeyOf = (field: ReturnType<typeof flattenFormSchema>[number]): string => {
    if (field.type === "fieldArray") return field.name;
    if ("valueKey" in field && field.valueKey) return field.valueKey;
    return field.name;
};

/**
 * True when `data` has a key for every field the form shows, so the form can open
 * without fetching the record again.
 */
export function isDataComplete(data: FormValues | undefined, formSchema?: FormSchema): boolean {
    if (!data) return false;
    if (!formSchema) return true;
    return shownFields(formSchema).every((field) => sourceKeyOf(field) in data);
}
