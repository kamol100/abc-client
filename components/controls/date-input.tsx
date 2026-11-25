"use client";

import { useState, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { DatePopover, useCalendarLocale } from "@/components/controls/date-popover";
import {
    formatDatePickerDisplay,
    parseSingleDate,
    toTimeInputValue,
    withTime,
} from "@/components/controls/date-format";
import { MyButton } from "@/components/my-button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

type DateInputProps = {
    id: string;
    /** A `Date`, a date string, or nothing. */
    value: unknown;
    /** Called with the picked `Date`, or undefined when the day is unpicked. */
    onChange: (value: Date | undefined) => void;
    /** Called when the clear button is pressed. */
    onClear: () => void;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
    /** How the picked day is shown (date-fns format). */
    dateFormat?: string;
    /** Close the calendar as soon as a day is picked. */
    closeOnSelect?: boolean;
    clearable?: boolean;
    /** Also pick a time. The calendar then stays open until Done. */
    showTime?: boolean;
    /** How the time part is shown when `showTime` is on. */
    timeFormat?: string;
    buttonRef?: Ref<HTMLButtonElement>;
    onBlur?: () => void;
};

/**
 * A control for one date, with an optional time. It only knows `value` and
 * `onChange`; `DatePicker` is its form field.
 */
export function DateInput({
    id,
    value,
    onChange,
    onClear,
    placeholder = "common.pick_date",
    disabled = false,
    hasError = false,
    dateFormat = "MM/dd/yyyy",
    closeOnSelect = true,
    clearable = true,
    showTime = false,
    timeFormat = "hh:mm a",
    buttonRef,
    onBlur,
}: DateInputProps) {
    const { t } = useTranslation();
    const locale = useCalendarLocale();
    const [open, setOpen] = useState(false);

    const selected = parseSingleDate(value);
    const displayFormat = showTime ? `${dateFormat} ${timeFormat}` : dateFormat;

    const handleSelect = (next: Date | undefined) => {
        if (showTime) {
            // Keep the chosen time (or now, for a first pick); stay open to set the time.
            onChange(next ? withTime(next, selected ?? new Date()) : undefined);
            return;
        }
        onChange(next);
        if (closeOnSelect && Boolean(next)) setOpen(false);
    };

    const handleTimeChange = (time: string) => {
        const match = /^(\d{2}):(\d{2})$/.exec(time);
        if (!match) return;
        const next = new Date(selected ?? new Date());
        next.setHours(Number(match[1]), Number(match[2]), 0, 0);
        onChange(next);
    };

    return (
        <DatePopover
            id={id}
            open={open}
            onOpenChange={setOpen}
            displayText={formatDatePickerDisplay(selected, "single", displayFormat)}
            placeholder={placeholder}
            disabled={disabled}
            hasError={hasError}
            showCalendarIcon
            showClear={clearable && !disabled && Boolean(selected)}
            onClear={() => {
                onClear();
                setOpen(false);
            }}
            buttonRef={buttonRef}
            onBlur={onBlur}
        >
            <div className="flex flex-col">
                <Calendar
                    locale={locale}
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    autoFocus
                    defaultMonth={selected ?? new Date()}
                />
                {showTime && (
                    <div className="flex items-center gap-2 border-t border-border p-2">
                        <Input
                            type="time"
                            aria-label={t("common.time")}
                            className="h-8 flex-1"
                            value={toTimeInputValue(selected)}
                            onChange={(event) => handleTimeChange(event.target.value)}
                        />
                        <MyButton
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={(event) => {
                                event.preventDefault();
                                setOpen(false);
                            }}
                        >
                            {t("common.done")}
                        </MyButton>
                    </div>
                )}
            </div>
        </DatePopover>
    );
}
