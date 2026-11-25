/**
 * Helpers that read a form's field config ("form schema").
 *
 * A form schema is either a flat list of fields, or a list of accordion sections that
 * each hold a list of fields. These helpers hide that difference from the rest of the
 * builder. Pure functions: no React, no form state.
 */
import type {
    AccordionSection,
    FieldConfig,
    FormFieldConfig,
} from "@/components/form-wrapper/form-builder-type";

export type FormSchema = FormFieldConfig[] | AccordionSection[];

/** Every top-level field, whether the schema is a flat list or accordion sections. */
export const flattenFormSchema = (formSchema?: FormSchema): FormFieldConfig[] => {
    if (!formSchema?.length) return [];
    if ("form" in formSchema[0]) {
        return (formSchema as AccordionSection[]).flatMap((section) => section.form);
    }
    return formSchema as FormFieldConfig[];
};

/**
 * Every field that holds a value. Slots are left out, and a field array is replaced
 * by the fields of one of its rows.
 */
export const flattenFieldConfigs = (formSchema: FormSchema): FieldConfig[] => {
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

/** A field the user can see and fill: not hidden by permission, and not a slot. */
const isShownField = (field: FormFieldConfig): boolean =>
    field.permission !== false && field.type !== "slot";

/** The fields the user can see and fill. */
export const shownFields = (formSchema?: FormSchema): FormFieldConfig[] =>
    flattenFormSchema(formSchema).filter(isShownField);

/** The names of the top-level fields. A server error is shown only under one of these. */
export const topLevelFieldNames = (formSchema?: FormSchema): Set<string> =>
    new Set(flattenFormSchema(formSchema).map((field) => field.name));
