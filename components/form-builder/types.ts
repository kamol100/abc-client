import type { ReactNode } from "react";

export type ValueMapping = {
    idKey: string;
    labelKey: string;
};

export type LabelProps = {
    labelText?: string;
    className?: string;
    labelClass?: string;
    mandatory?: boolean;
    tooltip?: string | null;
    tooltipClass?: string;
    labelSuffix?: string;
    labelTrailing?: string;
    labelTrailingValues?: Record<string, string | number>;
};

export type SelectOption = {
    value: string | number;
    label: string;
    meta?: Record<string, unknown>;
};

export type DropdownPopulate = {
    field: string;
    from: string;
};

/**
 * A test on the value of another field.
 *
 * `field` is the field to watch. Inside a row of a field array a plain name means the
 * field in the same row; a leading slash (`/status`) means a top-level field.
 */
export type FieldRule = {
    field: string;
    /** Passes while the watched value equals this (compared as text too, so 1 matches "1"). */
    equals?: string | number | boolean;
    /** Your own test on the watched value. Used first when given. */
    when?: (value: unknown) => boolean;
};

/**
 * One rule, or several: `{ all: [...] }` passes when every rule passes, `{ any: [...] }`
 * when at least one does.
 */
export type FieldCondition = FieldRule | { all: FieldRule[] } | { any: FieldRule[] };

/** Shows a field only while its condition passes. With neither `equals` nor `when`: while the watched field is filled. */
export type VisibleWhen = FieldCondition & {
    /** The value written into the field while it is hidden. Defaults to null. */
    resetValue?: string | number | boolean | null;
};

/** Disables a field while its condition passes. */
export type DisabledWhen = FieldCondition;

/**
 * What to do when the user changes a field.
 * `set`: write these values into other fields. Names follow the same rule as in a
 * condition: a plain name is a field of the same row, `/name` a top-level field.
 * Example: choosing another product clears the chosen lot and serials.
 */
export type FieldChangeEffect = {
    set: Record<string, unknown>;
};

type BaseFieldConfig = {
    name: string;
    label?: LabelProps;
    placeholder?: string;
    permission?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    order?: number;
    visibleWhen?: VisibleWhen;
    /** Disables the field while the rule passes, e.g. until another field is chosen. */
    disabledWhen?: DisabledWhen;
    /** Writes values into other fields when the user changes this one. */
    onChange?: FieldChangeEffect;
};

export type TextFieldConfig = BaseFieldConfig & {
    /** "tel": a Bangladeshi mobile number; phone keypad, and a typed +88 is removed on blur. */
    type: "text" | "email" | "password" | "number" | "tel";
    watchForFilter?: boolean;
    /**
     * Inside a field array: the key the API uses for this value when it differs from
     * `name`. It is read when the row has no value under `name`. Example: salary rows
     * are saved as `{ label, value }` but edited as `items_label` / `items_value`.
     */
    valueKey?: string;
    /** Cut a long error message to one line. Useful in narrow table columns. */
    errorEllipsis?: boolean;
    /** For a number input: the step between values. Use "any" to allow decimals. */
    step?: string | number;
    /** Keep room for one line of error under this field, so its row never changes height. */
    reserveErrorSpace?: boolean;
};

export type TextareaFieldConfig = BaseFieldConfig & {
    type: "textarea";
    rows?: number;
};

export type DropdownDependsOn = {
    field: string;
    buildApi: (parentValue: string | number) => string;
    resetOnChange?: boolean;
    /**
     * Whether the parent holds a value. By default anything but empty counts; pass
     * your own test when the parent uses a placeholder such as 0 for "nothing chosen".
     */
    isSet?: (parentValue: unknown) => boolean;
};

export type DropdownFieldConfig = BaseFieldConfig & {
    type: "dropdown";
    api?: string;
    options?: SelectOption[];
    defaultValue?: string | number;
    isMulti?: boolean;
    isSearchable?: boolean;
    isClearable?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    valueKey?: string;
    valueMapping?: ValueMapping;
    dependsOn?: DropdownDependsOn;
    populate?: DropdownPopulate[];
};

export type RadioFieldConfig = BaseFieldConfig & {
    type: "radio";
    options: { label: string; value: string | number; disabled?: boolean }[];
    direction?: "row" | "col";
    defaultValue?: string;
};

export type SwitchFieldConfig = BaseFieldConfig & {
    type: "switch";
    saveOnChange?: boolean;
};

export type CheckboxFieldConfig = BaseFieldConfig & {
    type: "checkbox";
    options?: { label: string; value: string | number; disabled?: boolean }[];
    direction?: "row" | "col";
    single?: boolean;
};

export type DateFieldConfig = BaseFieldConfig & {
    type: "date";
    dateFormat?: string;
    valueKey?: string;
    closeOnSelectDate?: boolean;
};

export type DateRangeFieldConfig = BaseFieldConfig & {
    type: "dateRange";
    dateFormat?: string;
    valueKey?: string;
    closeOnSelectDate?: boolean;
};

export type GeolocationFieldConfig = BaseFieldConfig & {
    type: "geolocation";
    latitudeName: string;
    longitudeName: string;
    latitudeLabel?: LabelProps;
    longitudeLabel?: LabelProps;
    latitudePlaceholder?: string;
    longitudePlaceholder?: string;
    getLocationLabel?: string;
    getLocationSuccess?: string;
    getLocationError?: string;
};

/** The current values a `compute` function reads. */
export type ComputeScope = {
    /** The row the field sits in, or the whole form for a top-level field. */
    row: Record<string, unknown>;
    /** Reads the whole form. Changes outside the row do not trigger a recompute. */
    getFormValues: () => Record<string, unknown>;
};

/**
 * A read-only value worked out from other fields, e.g. `amount * quantity`. It is kept
 * in the form like any other value, so Zod sees it and it is sent with the payload.
 */
export type ComputedFieldConfig = BaseFieldConfig & {
    type: "computed";
    compute: (scope: ComputeScope) => number | string | null;
    /** How the value is shown. Defaults to a number input. */
    inputType?: "number" | "text";
    /** Draw the value yourself (e.g. as formatted money) in place of the read-only input. */
    display?: (value: number | string | null) => ReactNode;
};

/** What a `custom` field's `render` function receives. */
export type CustomFieldRenderProps = {
    /** The full form path of the field, e.g. `lines.2.serial` inside a row. */
    name: string;
    /** The path of the row the field sits in (`lines.2`), or "" at the top level. */
    namePrefix: string;
};

/**
 * Your own component in a field's place, for anything the built-in types do not cover.
 * It gets the same wrapper as every field (`className`, `permission`, `visibleWhen`),
 * and can read and write the form with `useFormContext()`.
 */
export type CustomFieldConfig = BaseFieldConfig & {
    type: "custom";
    render: (props: CustomFieldRenderProps) => ReactNode;
    /**
     * The keys of the API record this field needs. An edit form fetches its record
     * when one is missing. Leave out for a field that holds no value.
     */
    sourceKeys?: string[];
};

export type SlotFieldConfig = BaseFieldConfig & {
    type: "slot";
    slot: string;
};

export type FieldConfig =
    | TextFieldConfig
    | TextareaFieldConfig
    | DropdownFieldConfig
    | RadioFieldConfig
    | SwitchFieldConfig
    | CheckboxFieldConfig
    | DateFieldConfig
    | DateRangeFieldConfig
    | GeolocationFieldConfig
    | ComputedFieldConfig
    | CustomFieldConfig;

export type FieldArrayConfig = {
    type: "fieldArray";
    name: string;
    label?: LabelProps;
    permission?: boolean;
    className?: string;
    visibleWhen?: VisibleWhen;
    itemFields: FieldConfig[];
    defaultItem: Record<string, unknown>;
    allowAppend?: boolean;
    allowRemove?: boolean;
    allowReorder?: boolean;
    minItems?: number;
    maxItems?: number;
    /** Drop rows whose item fields are all blank when the form is filled from saved data. */
    omitBlankItems?: boolean;
    grids?: number;
    gridGap?: string;
    addButtonLabel?: string;
    /** Keep room for one line of error under every row field, so rows never change height. */
    reserveErrorSpace?: boolean;
    /**
     * Draw the rows yourself, for a layout neither cards nor `table` can give. The
     * fields still come from `itemFields`: ask for one with `row.field("name")` and it
     * arrives with its rules, value handling and error text.
     */
    render?: (props: FieldArrayRenderProps) => ReactNode;
    /**
     * Draws the rows as a table: a heading with the Add button, a header row of column
     * names on wide screens, and one row per item. On a phone each row stacks its
     * fields under an "Item N" line. Without it, rows are drawn as cards.
     */
    table?: FieldArrayTable;
};

/** One row, as handed to a field array's own `render`. */
export type FieldArrayRow = {
    /** Stable React key of the row. */
    key: string;
    /** Position of the row, from 0. */
    index: number;
    /** Form path of the row, e.g. `product.2`. */
    path: string;
    /** Draws the row field with this name (from `itemFields`), or nothing if there is none. */
    field: (name: string) => ReactNode;
    /** Removes this row. */
    remove: () => void;
};

export type FieldArrayRenderProps = {
    rows: FieldArrayRow[];
    /** Adds a row with `defaultItem`. */
    addRow: () => void;
    /** False once `maxItems` is reached. */
    canAppend: boolean;
    /** False at `minItems`. */
    canRemove: boolean;
};

/** How wide a table column is, out of 12. */
export type FieldArrayColumn = number | { span: number; align?: "right" };

export type FieldArrayTable = {
    /** Heading above the rows (translation key). */
    title: string;
    /** Width of each row field by its `name`, out of 12. With the actions column they should add up to 12. */
    columns: Record<string, FieldArrayColumn>;
    /** Width of the column that holds the remove button. Defaults to 1. */
    actionsSpan?: number;
    /** "Item N" line shown above a row on a phone (translation key that takes `index`). */
    rowLabel: string;
    /** Name of the remove button (translation key). */
    removeLabel: string;
};

export type FormFieldConfig = FieldConfig | FieldArrayConfig | SlotFieldConfig;

export type AccordionSection = {
    name: string;
    label?: string;
    form: FormFieldConfig[];
};

export type HydratePolicy = "never" | "ifNeeded" | "always";

export const GRID_STYLES: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    7: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7",
    8: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8",
};
