"use client";

import { useCallback, useState, type MouseEvent, type Ref } from "react";
import { isAfter, isBefore, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { DatePopover, useCalendarLocale } from "@/components/controls/date-popover";
import {
    formatDatePickerDisplay,
    hasSelectedDateRange,
    isCompleteDateRange,
    parseDateRange,
} from "@/components/controls/date-format";
import { MyButton } from "@/components/my-button";
import { Calendar } from "@/components/ui/calendar";

type DateRangeInputProps = {
    id: string;
    /** `{ from, to }` of `Date`s or date strings, or nothing. */
    value: unknown;
    /** Called with the finished range. */
    onChange: (value: DateRange | undefined) => void;
    /** Called when the clear button is pressed. */
    onClear: () => void;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
    /** How the range is shown: two date-fns formats joined by " - ". */
    rangeDateFormat?: string;
    /** Close the calendar as soon as the range is finished. */
    closeOnSelect?: boolean;
    clearable?: boolean;
    /** Drop the calendar icon once a range is shown, to leave room for the text. */
    hideIconWhenSelected?: boolean;
    buttonRef?: Ref<HTMLButtonElement>;
    onBlur?: () => void;
};

const isDayStrictlyBetween = (date: Date, from: Date, to: Date) => {
    const start = isBefore(from, to) ? from : to;
    const end = start === from ? to : from;
    return isAfter(date, start) && isBefore(date, end);
};

/** The range to preview while the first day is picked and the pointer is on another day. */
const previewRange = (
    pending: DateRange | undefined,
    hoveredDay: Date | undefined,
    choosing: boolean,
): DateRange | undefined => {
    if (!choosing || !pending?.from || pending.to || !hoveredDay) return undefined;
    if (isSameDay(pending.from, hoveredDay)) return undefined;
    return isBefore(hoveredDay, pending.from)
        ? { from: hoveredDay, to: pending.from }
        : { from: pending.from, to: hoveredDay };
};

const RANGE_CLASS_NAMES = {
    range_start:
        "bg-accent text-accent-foreground rounded-l-md [&:not(:has([data-range-end=true]))_button]:![border:2px_solid_transparent]",
    range_middle:
        "bg-accent text-accent-foreground rounded-none [&_button]:![border:2px_solid_transparent]",
    range_end:
        "bg-accent text-accent-foreground rounded-r-md [&:not(:has([data-range-start=true]))_button]:![border:2px_solid_transparent]",
};

const PREVIEW_CLASS_NAMES = {
    preview_middle:
        "range-preview-middle bg-accent text-accent-foreground [&_button]:bg-accent [&_button]:text-accent-foreground [&_button]:rounded-none",
    preview_edge:
        "range-preview-edge bg-accent [&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:hover:bg-primary [&_button]:hover:text-primary-foreground",
};

/**
 * A control for a from/to pair of dates. It only knows `value` and `onChange`;
 * `DatePicker` with `mode="range"` is its form field.
 *
 * Picking works in two clicks. After the first click the range is "pending": it is
 * shown and previewed on hover, but not yet given to `onChange`. The second click
 * finishes it. Apply finishes a one-day range.
 */
export function DateRangeInput({
    id,
    value,
    onChange,
    onClear,
    placeholder = "common.pick_date",
    disabled = false,
    hasError = false,
    rangeDateFormat = "MM/dd/yyyy - MM/dd/yyyy",
    closeOnSelect = true,
    clearable = true,
    hideIconWhenSelected = true,
    buttonRef,
    onBlur,
}: DateRangeInputProps) {
    const { t } = useTranslation();
    const locale = useCalendarLocale();
    const [open, setOpen] = useState(false);
    const [isChoosing, setIsChoosing] = useState(false);
    const [pendingRange, setPendingRange] = useState<DateRange | undefined>();
    const [hoveredDay, setHoveredDay] = useState<Date | undefined>();

    const resetPending = useCallback(() => {
        setIsChoosing(false);
        setPendingRange(undefined);
        setHoveredDay(undefined);
    }, []);

    const clearHoverPreview = useCallback(() => {
        setHoveredDay((current) => (current ? undefined : current));
    }, []);

    const handleCalendarMouseLeave = useCallback((event: MouseEvent<HTMLDivElement>) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
        clearHoverPreview();
    }, [clearHoverPreview]);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) resetPending();
    };

    const commit = (next: DateRange) => {
        onChange(next);
        resetPending();
        if (closeOnSelect) setOpen(false);
    };

    const handleSelect = (next: DateRange | undefined) => {
        setHoveredDay(undefined);
        if (isCompleteDateRange(next)) {
            commit(next);
            return;
        }
        setIsChoosing(true);
        setPendingRange(next);
    };

    const handleApply = () => {
        if (!pendingRange?.from) return;
        commit(pendingRange.to ? pendingRange : { from: pendingRange.from, to: pendingRange.from });
    };

    const committedRange = parseDateRange(value);
    const selectedRange = isChoosing ? pendingRange : committedRange;
    const hoveredPreview = previewRange(pendingRange, hoveredDay, isChoosing);
    const canApply = Boolean(isChoosing && pendingRange?.from && !isCompleteDateRange(pendingRange));

    return (
        <DatePopover
            id={id}
            open={open}
            onOpenChange={handleOpenChange}
            displayText={formatDatePickerDisplay(committedRange, "range", undefined, rangeDateFormat)}
            placeholder={placeholder}
            disabled={disabled}
            hasError={hasError}
            showCalendarIcon={!(hideIconWhenSelected && hasSelectedDateRange(committedRange))}
            showClear={clearable && !disabled && Boolean(committedRange)}
            onClear={() => {
                onClear();
                resetPending();
                setOpen(false);
            }}
            buttonRef={buttonRef}
            onBlur={onBlur}
        >
            <div className="flex flex-col">
                <div
                    data-slot="range-calendar"
                    className="w-fit"
                    onMouseLeave={handleCalendarMouseLeave}
                >
                    <Calendar
                        locale={locale}
                        mode="range"
                        min={1}
                        selected={selectedRange}
                        onSelect={handleSelect}
                        onDayMouseEnter={(date) => {
                            if (!isChoosing || pendingRange?.to) return;
                            setHoveredDay((current) =>
                                current && isSameDay(current, date) ? current : date,
                            );
                        }}
                        modifiers={{
                            preview_middle: (date) => Boolean(
                                hoveredPreview?.from &&
                                hoveredPreview.to &&
                                isDayStrictlyBetween(date, hoveredPreview.from, hoveredPreview.to),
                            ),
                            preview_edge: (date) => Boolean(
                                hoveredPreview?.from &&
                                hoveredPreview.to &&
                                pendingRange?.from &&
                                !isSameDay(date, pendingRange.from) &&
                                (isSameDay(date, hoveredPreview.from) || isSameDay(date, hoveredPreview.to)),
                            ),
                        }}
                        modifiersClassNames={PREVIEW_CLASS_NAMES}
                        classNames={RANGE_CLASS_NAMES}
                        autoFocus
                        numberOfMonths={1}
                        defaultMonth={selectedRange?.from ?? new Date()}
                    />
                </div>
                <div
                    className="border-t border-border p-2"
                    onMouseEnter={clearHoverPreview}
                >
                    <MyButton
                        type="button"
                        variant="default"
                        size="sm"
                        className="w-full"
                        disabled={!canApply}
                        onMouseEnter={clearHoverPreview}
                        onClick={(event) => {
                            event.preventDefault();
                            handleApply();
                        }}
                    >
                        {t("common.apply")}
                    </MyButton>
                </div>
            </div>
        </DatePopover>
    );
}
