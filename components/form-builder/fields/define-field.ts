/**
 * What a field type is.
 *
 * Every field type (text, dropdown, date, ...) is described once, by a field
 * definition. The form builder and the table filter both read these definitions, so
 * a new field type is one new file in this folder plus one line in `registry.ts`.
 */
import type { ReactNode } from "react";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

/** Returned by `readValue` or `toFilterParam` to say "leave the value as it is". */
export const KEEP_VALUE = Symbol("keep value");

/** Returned by `toFilterParam` to say "leave this field out of the query". */
export const DROP_VALUE = Symbol("drop value");

export type FormFieldProps<Config extends FieldConfig = FieldConfig> = {
    /** The field's config from the form schema. */
    field: Config;
    /** The full form path of the value, e.g. `name` or `items.2.name` inside a row. */
    name: string;
    /** The path of the row the field sits in (`items.2`), or "" at the top level. */
    namePrefix: string;
};

export type FilterFieldProps<Config extends FieldConfig = FieldConfig> = {
    field: Config;
    /** The field's current value in the filter form. */
    value: unknown;
    /** Call after the value changed, to run the filter again. */
    onValueChange: () => void;
    /** Empties the named field and runs the filter again. */
    onClear: (name: string) => void;
};

export type FieldDefinition<Config extends FieldConfig = FieldConfig> = {
    /** The `type` values this definition handles. */
    types: readonly Config["type"][];
    /**
     * The user types free text into it. A table filter can apply such a field while
     * the user types, and offers a Search button for the ones that do not.
     */
    isTextInput?: boolean;
    /** Draws the field in a form. */
    render: (props: FormFieldProps<Config>) => ReactNode;
    /**
     * Reads the field's form value out of an API record, for types whose API shape is
     * not the form shape (a date string, a related record). Return `KEEP_VALUE` to
     * leave the record's own value. Types without it use the record's value as it is.
     */
    readValue?: (field: Config, record: Record<string, unknown>) => unknown;
    /**
     * The keys of an API record this field needs, for types that do not read the key
     * named by `valueKey` or `name`. Used to decide whether an edit form must fetch
     * its record again.
     */
    sourceKeys?: (field: Config) => string[];
    /** Draws the field in a table filter. Types without it are not drawn in filters. */
    renderFilter?: (props: FilterFieldProps<Config>) => ReactNode;
    /**
     * Turns a filter value into its query-string form. Return `KEEP_VALUE` to send the
     * value as it is, or `DROP_VALUE` to leave the field out.
     */
    toFilterParam?: (value: unknown) => unknown;
};

/**
 * Declares a field type. Inside, `field` has the config type of that field type
 * (e.g. `DropdownFieldConfig`), so its own options are typed.
 */
export function defineField<Config extends FieldConfig>(
    definition: FieldDefinition<Config>,
): FieldDefinition {
    // The registry holds definitions for different config types in one list, so the
    // specific type is widened here. It is safe because a definition is only ever
    // looked up by `field.type`, which is what narrows the config.
    return definition as unknown as FieldDefinition;
}
