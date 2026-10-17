"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, isSameDay } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Control, Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import type { DateRange, DayPickerLocale } from "react-day-picker";
import { enUS, bn } from "react-day-picker/locale";
import { useTranslation } from "react-i18next";
import Label from "../label";
import { MyButton } from "../my-button";
import { Calendar } from "../ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import type { LabelProps } from "../form-wrapper/form-builder-type";
import FieldError from "./field-error";
import { parseLanguage } from "@/lib/i18n/languages";

export type DatePickerMode = "single" | "range";

export type DatePickerValue = Date | DateRange | undefined;

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
};

const RANGE_SEPARATOR = " - ";

const rangeEndpointFormats = (rangeDateFormat: string) => {
    const splitAt = rangeDateFormat.indexOf(RANGE_SEPARATOR);
    if (splitAt === -1) {
        return { fromFormat: rangeDateFormat, toFormat: rangeDateFormat };
    }
    return {
        fromFormat: rangeDateFormat.slice(0, splitAt),
        toFormat: rangeDateFormat.slice(splitAt + RANGE_SEPARATOR.length),
    };
};

export const formatDatePickerDisplay = (
    value: DatePickerValue,
    mode: DatePickerMode,
    dateFormat = "MM/dd/yyyy",
    rangeDateFormat = "MM/dd/yyyy - MM/dd/yyyy",
): string | null => {
    if (mode !== "range") {
        return value instanceof Date ? format(value, dateFormat) : null;
    }

    const range = value instanceof Date ? undefined : value;
    if (!range?.from) return null;

    const { fromFormat, toFormat } = rangeEndpointFormats(rangeDateFormat);
    const fromLabel = format(range.from, fromFormat);
    if (!range.to || isSameDay(range.from, range.to)) return fromLabel;
    return `${fromLabel}${RANGE_SEPARATOR}${format(range.to, toFormat)}`;
};

export const hasSelectedDateRange = (value: DatePickerValue): boolean => {
    if (!value || value instanceof Date || !value.from || !value.to) return false;
    return !isSameDay(value.from, value.to);
};

const isCompleteDateRange = (
    range: DateRange | undefined,
): range is DateRange & { from: Date; to: Date } =>
    Boolean(range?.from && range.to && !isSameDay(range.from, range.to));

const isDayStrictlyBetween = (date: Date, from: Date, to: Date) => {
    const start = isBefore(from, to) ? from : to;
    const end = start === from ? to : from;
    return isAfter(date, start) && isBefore(date, end);
};

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

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseCalendarDate = (value: string | Date): Date | undefined => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value;
    }

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const match = DATE_ONLY_PATTERN.exec(trimmed);
    if (match) {
        const year = Number(match[1]);
        const monthIndex = Number(match[2]) - 1;
        const day = Number(match[3]);
        return new Date(year, monthIndex, day);
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const parseValue = (
    value: unknown,
    mode: DatePickerMode
): Date | DateRange | undefined => {
    if (value == null || value === "") return undefined;
    if (mode === "range") {
        const range = value as { from?: string | Date; to?: string | Date };
        const from = range?.from ? parseCalendarDate(range.from) : undefined;
        const to = range?.to ? parseCalendarDate(range.to) : undefined;
        if (!from) return undefined;
        return { from, to };
    }
    if (value instanceof Date || typeof value === "string") {
        return parseCalendarDate(value);
    }
    return undefined;
};

const DatePicker = ({
    name,
    label,
    placeholder = "Pick a date",
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
}: DatePickerProps) => {
    const { t, i18n } = useTranslation();
    const language = parseLanguage(i18n.language);
    const locale = language === "en" ? enUS : bn;
    const { control: ctxControl } = useFormContext();
    const control = controlProp ?? ctxControl;
    const rules = rulesProp ?? (required ? { required: "This field is required" } : undefined);
    const [open, setOpen] = useState(false);
    const [isChoosingRange, setIsChoosingRange] = useState(false);
    const [pendingRange, setPendingRange] = useState<DateRange | undefined>();
    const [hoveredDay, setHoveredDay] = useState<Date | undefined>();

    const displayValue = (value: DatePickerValue) =>
        formatDatePickerDisplay(value, mode, dateFormat, rangeDateFormat);

    const resetPendingRange = useCallback(() => {
        setIsChoosingRange(false);
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

    const handleOpenChange = useCallback((nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) resetPendingRange();
    }, [resetPendingRange]);

    const commitValue = useCallback((
        next: DatePickerValue,
        onChange: (value: DatePickerValue) => void,
        shouldClose: boolean,
    ) => {
        onChange(next);
        onValueChange?.(next);
        resetPendingRange();
        if (shouldClose) setOpen(false);
    }, [onValueChange, resetPendingRange]);

    const handleSelect = useCallback((next: Date | undefined, onChange: (value: DatePickerValue) => void) => {
        commitValue(next, onChange, closeOnSelectDate && Boolean(next));
    }, [closeOnSelectDate, commitValue]);

    const handleRangeSelect = useCallback((
        next: DateRange | undefined,
        onChange: (value: DatePickerValue) => void,
    ) => {
        setHoveredDay(undefined);
        if (isCompleteDateRange(next)) {
            commitValue(next, onChange, closeOnSelectDate);
            return;
        }
        setIsChoosingRange(true);
        setPendingRange(next);
    }, [closeOnSelectDate, commitValue]);

    const handleApplyRange = useCallback((onChange: (value: DatePickerValue) => void) => {
        if (!pendingRange?.from) return;
        const committed = pendingRange.to
            ? pendingRange
            : { from: pendingRange.from, to: pendingRange.from };
        commitValue(committed, onChange, closeOnSelectDate);
    }, [closeOnSelectDate, commitValue, pendingRange]);

    const handleClear = useCallback((onChange: (value: null) => void) => {
        onChange(null);
        onValueChange?.(undefined);
        resetPendingRange();
        setOpen(false);
    }, [onValueChange, resetPendingRange]);

    const hoveredPreview = previewRange(pendingRange, hoveredDay, isChoosingRange);
    const canApplyRange = Boolean(
        isChoosingRange && pendingRange?.from && !isCompleteDateRange(pendingRange),
    );

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error: fieldError } }) => {
                    const parsed = parseValue(value, mode);
                    const committedRange = parsed instanceof Date ? undefined : parsed;
                    const selectedRange = isChoosingRange ? pendingRange : committedRange;
                    const showClear = clearable && !disabled && Boolean(parsed);
                    const showCalendarIcon = !(
                        hide_calendar_icon_on_date_range &&
                        mode === "range" &&
                        hasSelectedDateRange(parsed)
                    );
                    return (
                        <div className="relative w-full">
                            <Popover open={open} onOpenChange={handleOpenChange}>
                                <PopoverTrigger asChild>
                                    <MyButton
                                        ref={ref}
                                        variant="outline"
                                        size="default"
                                        onBlur={onBlur}
                                        disabled={disabled}
                                        className={cn(
                                            "h-9 w-full min-w-0 justify-start overflow-hidden px-3 text-left font-normal bg-background shadow-sm",
                                            showClear && "pr-8",
                                            !parsed && "text-muted-foreground",
                                            fieldError && "border-destructive"
                                        )}
                                    >
                                        {showCalendarIcon && <CalendarIcon />}
                                        <span className="min-w-0 truncate">
                                            {displayValue(parsed) ?? t(placeholder)}
                                        </span>
                                    </MyButton>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    {mode === "range" ? (
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
                                                    onSelect={(next) => handleRangeSelect(next, onChange)}
                                                    onDayMouseEnter={(date) => {
                                                        if (!isChoosingRange || pendingRange?.to) return;
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
                                                    disabled={!canApplyRange}
                                                    onMouseEnter={clearHoverPreview}
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        handleApplyRange(onChange);
                                                    }}
                                                >
                                                    {t("common.apply")}
                                                </MyButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <Calendar
                                            locale={locale}
                                            mode="single"
                                            selected={parsed as Date | undefined}
                                            onSelect={(next) => handleSelect(next, onChange)}
                                            autoFocus
                                            defaultMonth={
                                                (parsed as Date | undefined) ?? new Date()
                                            }
                                        />
                                    )}
                                </PopoverContent>
                            </Popover>
                            {showClear && (
                                <button
                                    type="button"
                                    aria-label={t("common.clear")}
                                    className="absolute right-2 top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        handleClear(onChange);
                                    }}
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                    );
                }}
            />
            <FieldError name={name} />
        </div>
    );
};

export default DatePicker;
