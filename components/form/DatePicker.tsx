"use client";

import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form";
import type { DayPickerLocale } from "react-day-picker";
import { DateInput } from "@/components/controls/date-input";
import { DateRangeInput } from "@/components/controls/date-range-input";
import type { DatePickerMode, DatePickerValue } from "@/components/controls/date-format";
import { FieldShell, useFieldControl, useFieldId } from "@/components/form-builder/fields/field-shell";
import type { LabelProps } from "@/components/form-builder/types";
import { cn } from "@/lib/utils";

export { formatDatePickerDisplay, hasSelectedDateRange } from "@/components/controls/date-format";
export type { DatePickerMode, DatePickerValue } from "@/components/controls/date-format";

type DatePickerProps = {
    name: string;
    label?: LabelProps;
    placeholder?: string;
    mode?: DatePickerMode;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    dateFormat?: string;
    rangeDateFormat?: string;
    control?: Control<FieldValues>;
    rules?: RegisterOptions;
    onValueChange?: (value: DatePickerValue) => void;
    closeOnSelectDate?: boolean;
    clearable?: boolean;
    hide_calendar_icon_on_date_range?: boolean;
    locale?: Partial<DayPickerLocale>;
    /**
     * Single mode only: also pick a time (a time field under the calendar). The value
     * stays a Date, now with hours and minutes, and the popover stays open until Done.
     * Off by default, so existing pickers are unchanged.
     */
    showTime?: boolean;
    /** Display format for the time part when showTime is on. */
    timeFormat?: string;
};

/**
 * The date picker as a form field: a `DateInput` (one day) or a `DateRangeInput`
 * (from/to), bound to React Hook Form, with a label and an error.
 *
 * The form holds a `Date` (or `{ from, to }`), and null after the value is cleared.
 */
const DatePicker = ({
    name,
    label,
    placeholder = "common.pick_date",
    mode = "single",
    className,
    disabled = false,
    required = false,
    dateFormat = "MM/dd/yyyy",
    rangeDateFormat = "MM/dd/yyyy - MM/dd/yyyy",
    control: controlProp,
    rules: rulesProp,
    onValueChange,
    closeOnSelectDate = true,
    clearable = true,
    hide_calendar_icon_on_date_range = true,
    showTime = false,
    timeFormat = "hh:mm a",
}: DatePickerProps) => {
    const control = useFieldControl(controlProp);
    const id = useFieldId(name);
    const rules = rulesProp ?? (required ? { required: "This field is required" } : undefined);

    return (
        <FieldShell name={name} label={label} labelFor={id} className={cn("flex flex-col gap-1", className)}>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => {
                    const handleChange = (next: DatePickerValue) => {
                        onChange(next);
                        onValueChange?.(next);
                    };
                    const handleClear = () => {
                        onChange(null);
                        onValueChange?.(undefined);
                    };

                    return mode === "range" ? (
                        <DateRangeInput
                            id={id}
                            value={value}
                            onChange={handleChange}
                            onClear={handleClear}
                            placeholder={placeholder}
                            disabled={disabled}
                            hasError={Boolean(error)}
                            rangeDateFormat={rangeDateFormat}
                            closeOnSelect={closeOnSelectDate}
                            clearable={clearable}
                            hideIconWhenSelected={hide_calendar_icon_on_date_range}
                            buttonRef={ref}
                            onBlur={onBlur}
                        />
                    ) : (
                        <DateInput
                            id={id}
                            value={value}
                            onChange={handleChange}
                            onClear={handleClear}
                            placeholder={placeholder}
                            disabled={disabled}
                            hasError={Boolean(error)}
                            dateFormat={dateFormat}
                            closeOnSelect={closeOnSelectDate}
                            clearable={clearable}
                            showTime={showTime}
                            timeFormat={timeFormat}
                            buttonRef={ref}
                            onBlur={onBlur}
                        />
                    );
                }}
            />
        </FieldShell>
    );
};

export default DatePicker;
