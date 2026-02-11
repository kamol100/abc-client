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
    permission: boolean;
    className?: string;
    order?: number;
};

export type TextFieldConfig = BaseFieldConfig & {
    type: "text" | "email" | "password" | "number";
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

export type AccordionSection = {
    name: string;
    label?: string;
    form: FieldConfig[];
};

export const GRID_STYLES: Record<number, string> = {
    1: "md:grid-cols-1 lg:grid-cols-1 sm:grid-cols-1",
    2: "md:grid-cols-2 lg:grid-cols-2 sm:grid-cols-2",
    3: "md:grid-cols-3 lg:grid-cols-3 sm:grid-cols-3",
    4: "md:grid-cols-4 lg:grid-cols-4 sm:grid-cols-4",
    5: "md:grid-cols-5 lg:grid-cols-5 sm:grid-cols-4",
    6: "md:grid-cols-6 lg:grid-cols-6 sm:grid-cols-4",
    7: "md:grid-cols-7 lg:grid-cols-7 sm:grid-cols-4",
    8: "md:grid-cols-8 lg:grid-cols-8 sm:grid-cols-4",
};
