"use client";

import { ChevronDown, X } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, {
    components as selectComponents,
    MultiValue,
    SingleValue,
} from "react-select";
import type {
    ClearIndicatorProps,
    DropdownIndicatorProps,
    GroupBase,
} from "react-select";
import { selectStyles, selectTheme } from "@/components/controls/select-styles";
import type { SelectOption } from "@/components/form-wrapper/form-builder-type";
import { cn } from "@/lib/utils";

function SelectDropdownIndicator(
    props: DropdownIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>,
) {
    return (
        <selectComponents.DropdownIndicator {...props}>
            <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-current"
                strokeWidth={2}
            />
        </selectComponents.DropdownIndicator>
    );
}

function SelectClearIndicator(
    props: ClearIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>,
) {
    return (
        <selectComponents.ClearIndicator {...props}>
            <X
                aria-hidden
                className="size-4 shrink-0 text-current"
                strokeWidth={2}
            />
        </selectComponents.ClearIndicator>
    );
}

const indicatorComponents = {
    DropdownIndicator: SelectDropdownIndicator,
    ClearIndicator: SelectClearIndicator,
};

/** What a dropdown holds: one option value, a list of them (multi), or null when empty. */
export type SelectBoxValue = string | number | null | Array<string | number>;

type SelectBoxProps = {
    /** Used as the input's id and name. In a form this is the field name. */
    id: string;
    /** The chosen option value, or a list of values when `isMulti`. */
    value: unknown;
    /** Called with the new value. For a single select, `selected` is the chosen option. */
    onChange: (value: SelectBoxValue, selected?: SelectOption | null) => void;
    options: SelectOption[];
    isMulti?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    isClearable?: boolean;
    isSearchable?: boolean;
    /** A translation key. */
    placeholder?: string;
    /** Draws the red error border. */
    hasError?: boolean;
};

/** A value matches an option when they are equal as text, so "2" selects the option 2. */
const isOptionMatch = (optionValue: string | number, value: unknown) => {
    if (value === undefined || value === null || value === "") return false;
    return String(optionValue) === String(value);
};

/**
 * The dropdown control (react-select). It only knows `value` and `onChange`, so it
 * works in a form, a filter, or on its own. `SelectDropdown` is its form field.
 */
export function SelectBox({
    id,
    value,
    onChange,
    options,
    isMulti = false,
    isDisabled = false,
    isLoading = false,
    isClearable = true,
    isSearchable = true,
    placeholder = "common.select_option",
    hasError = false,
}: SelectBoxProps) {
    const { t } = useTranslation();

    // The menu is drawn on <body> so a dialog or a scrolling panel cannot cut it off.
    const menuPortalTarget = useMemo(
        () => (typeof window !== "undefined" ? document.body : null),
        [],
    );

    const selectedOption = (() => {
        if (value === undefined || value === null || value === "") return null;
        if (isMulti && Array.isArray(value)) {
            return options.filter((option) =>
                value.some((currentValue) => isOptionMatch(option.value, currentValue)),
            );
        }
        return options.find((option) => isOptionMatch(option.value, value)) ?? null;
    })();

    return (
        <Select<SelectOption, boolean>
            inputId={id}
            instanceId={id}
            className={cn("basic-single")}
            classNamePrefix="select"
            components={indicatorComponents}
            menuPortalTarget={menuPortalTarget}
            menuPosition="fixed"
            isSearchable={isSearchable}
            isClearable={isClearable}
            isDisabled={isDisabled}
            isLoading={isLoading}
            placeholder={t(placeholder)}
            isMulti={isMulti}
            name={id}
            options={options}
            value={selectedOption}
            formatOptionLabel={(option) => t(option.label)}
            onChange={(newValue) => {
                if (isMulti) {
                    onChange((newValue as MultiValue<SelectOption>).map((option) => option.value));
                } else {
                    const selected = newValue as SingleValue<SelectOption>;
                    onChange(selected?.value ?? null, selected);
                }
            }}
            styles={selectStyles(hasError)}
            theme={selectTheme}
        />
    );
}
