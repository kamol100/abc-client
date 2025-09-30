export type FormBuilderType = {
    name: string;
    type?: string;
    label?: string;
    placeholder?: string;
    schema?: string;
    initialData?: Array<any>;
    isReFetch?: boolean;
    value?: "value" | "label";
    isMulti?: boolean;
    permission: boolean;
    mandatory?: boolean;
    tooltip?: string | null;
    tooltipClass?: string;
    api?: string
    options?: Array<any>,
    defaultValue?: any;
    isDisabled?: boolean;
    isLoading?: boolean;
    isClearable?: boolean;
    className?: string
    isShow?: boolean
    switchValue?: string | boolean | number,
    saveOnchange?: boolean
    direction?: "row" | "col"
    order?: number | string


};

export type AccordionFormBuilderType = {
    name: string,
    label?: string,
    form: FormBuilderType[]
}