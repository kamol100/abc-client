"use client";

import { SelectBox, type SelectBoxValue } from "@/components/controls/select-box";
import { useSelectOptions } from "@/components/controls/use-select-options";
import type { LabelProps, SelectOption } from "@/components/form-builder/types";
import Label from "@/components/label";

type SelectInputProps = {
    /** The id of the input, also used to keep its options apart in the cache. */
    id: string;
    /** The chosen option value, or a list of values when `isMulti`. */
    value: unknown;
    /** Called with the new value. For a single select, `selected` is the chosen option. */
    onChange: (value: SelectBoxValue, selected?: SelectOption | null) => void;
    label?: LabelProps;
    /** A `/dropdown-...` endpoint to load the options from. */
    api?: string;
    /** The options, when they are not loaded from `api`. */
    options?: SelectOption[];
    /** Which key of an API record is the option value. Defaults to `id`. */
    optionValueKey?: string;
    /** Which key of an API record is the option label. Defaults to `name`. */
    optionLabelKey?: string;
    isMulti?: boolean;
    isDisabled?: boolean;
    isClearable?: boolean;
    isSearchable?: boolean;
    /** A translation key. */
    placeholder?: string;
};

/**
 * A dropdown with its label and its options, for use outside a form: you hold the
 * value in state and get told when it changes.
 *
 * Inside a form use `SelectDropdown` (or a `dropdown` field in a form builder config),
 * which also shows validation errors.
 */
export function SelectInput({
    id,
    value,
    onChange,
    label,
    api,
    options: staticOptions,
    optionValueKey,
    optionLabelKey,
    isMulti,
    isDisabled,
    isClearable,
    isSearchable,
    placeholder,
}: SelectInputProps) {
    const { options, isLoading, loadFailed, reload } = useSelectOptions({
        name: id,
        api,
        staticOptions,
        optionValueKey,
        optionLabelKey,
    });

    return (
        <div>
            {label && (
                <div className="mb-2">
                    <Label htmlFor={id} label={label} />
                </div>
            )}
            <SelectBox
                id={id}
                value={value}
                onChange={onChange}
                options={options}
                isMulti={isMulti}
                isDisabled={isDisabled}
                isLoading={isLoading}
                isClearable={isClearable}
                isSearchable={isSearchable}
                placeholder={placeholder}
                loadFailed={loadFailed}
                onReload={reload}
            />
        </div>
    );
}
