import type { RegisterOptions } from "react-hook-form";

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
};

export type SelectOption = {
    value: string | number;
    label: string;
};

type BaseFieldConfig = {
    name: string;
    label?: LabelProps;
    placeholder?: string;
    permission?: boolean;
    className?: string;
    order?: number;
    rules?: RegisterOptions;
};

export type TextFieldConfig = BaseFieldConfig & {
    type: "text" | "email" | "password" | "number";
    watchForFilter?: boolean;
};

export type TextareaFieldConfig = BaseFieldConfig & {
    type: "textarea";
    rows?: number;
};

export type DropdownFieldConfig = BaseFieldConfig & {
    type: "dropdown";
    api?: string;
    options?: SelectOption[];
    isMulti?: boolean;
    isSearchable?: boolean;
    isClearable?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    valueKey?: string;
    valueMapping?: ValueMapping;
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
    required?: boolean;
};

export type DateRangeFieldConfig = BaseFieldConfig & {
    type: "dateRange";
    dateFormat?: string;
    valueKey?: string;
    required?: boolean;
};

export type FieldConfig =
    | TextFieldConfig
    | TextareaFieldConfig
    | DropdownFieldConfig
    | RadioFieldConfig
    | SwitchFieldConfig
    | CheckboxFieldConfig
    | DateFieldConfig
    | DateRangeFieldConfig;

export type FieldArrayConfig = {
    type: "fieldArray";
    name: string;
    label?: LabelProps;
    permission?: boolean;
    className?: string;
    itemFields: FieldConfig[];
    defaultItem: Record<string, unknown>;
    allowAppend?: boolean;
    allowRemove?: boolean;
    allowReorder?: boolean;
    minItems?: number;
    maxItems?: number;
    grids?: number;
    gridGap?: string;
    addButtonLabel?: string;
};

export type FormFieldConfig = FieldConfig | FieldArrayConfig;

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
