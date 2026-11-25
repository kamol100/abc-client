/**
 * Turns a record from the API into the values a form starts with.
 *
 *   API record  ->  toFormValues()  ->  applyFormFieldDefaults()  ->  form values
 *
 * The API returns dates as strings and related records as objects (`zone: { id, name }`).
 * The form needs `Date` objects and plain ids (`zone_id: 3`). How one field type is read
 * is written in that type's definition, in `components/form-builder/fields/`.
 */
import type {
    FieldArrayConfig,
    FieldConfig,
    FormFieldConfig,
} from "@/components/form-wrapper/form-builder-type";
import {
    flattenFieldConfigs,
    flattenFormSchema,
    shownFields,
    type FormSchema,
} from "@/components/form-builder/core/form-schema";
import { KEEP_VALUE } from "@/components/form-builder/fields/define-field";
import { fieldDefinitionOf } from "@/components/form-builder/fields/registry";

type FormValues = Record<string, unknown>;

// --- One record (the form itself, or one row of a field array) ---

/**
 * Converts the values of `fields` inside `data`. Every key of `data` is kept. Each
 * field type says how to read its own value (see `readValue` in its definition); the
 * result is written under the field name.
 */
const convertFieldValues = (data: FormValues, fields: FieldConfig[]): FormValues => {
    const formValues: FormValues = { ...data };

    fields.forEach((field) => {
        const readValue = fieldDefinitionOf(field.type)?.readValue;
        if (!readValue) return;

        const value = readValue(field, data);
        if (value !== KEEP_VALUE) formValues[field.name] = value;
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

/** The keys of the API record that a field reads its value from. */
const sourceKeysOf = (field: FormFieldConfig): string[] => {
    if (field.type === "fieldArray" || field.type === "slot") return [field.name];

    const ownKeys = fieldDefinitionOf(field.type)?.sourceKeys?.(field);
    if (ownKeys) return ownKeys;
    if ("valueKey" in field && field.valueKey) return [field.valueKey];
    return [field.name];
};

/**
 * True when `data` has a key for every field the form shows, so the form can open
 * without fetching the record again.
 */
export function isDataComplete(data: FormValues | undefined, formSchema?: FormSchema): boolean {
    if (!data) return false;
    if (!formSchema) return true;
    return shownFields(formSchema).every((field) =>
        sourceKeysOf(field).every((key) => key in data),
    );
}
