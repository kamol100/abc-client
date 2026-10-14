"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
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

const parseValue = (
    value: unknown,
    mode: DatePickerMode
): Date | DateRange | undefined => {
    if (value == null) return undefined;
    if (mode === "range") {
        const range = value as { from?: string | Date; to?: string | Date };
        const from = range?.from ? (range.from instanceof Date ? range.from : new Date(range.from)) : undefined;
        const to = range?.to ? (range.to instanceof Date ? range.to : new Date(range.to)) : undefined;
        if (!from) return undefined;
        return { from, to };
    }
    const d = value as string | Date;
    return d instanceof Date ? d : d ? new Date(d) : undefined;
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

    const displayValue = (value: DatePickerValue) =>
        formatDatePickerDisplay(value, mode, dateFormat, rangeDateFormat);

    const handleSelect = useCallback((next: Date | DateRange | undefined, onChange: (value: DatePickerValue) => void) => {
        onChange(next);
        onValueChange?.(next);
        if (!closeOnSelectDate) {
            return;
        }
        const shouldClose = mode === "range" ? Boolean(next && "from" in next && next.from && next.to) : Boolean(next);

        if (shouldClose) {
            setOpen(false);
        }
    },
        [closeOnSelectDate, mode, onValueChange]
    );

    const handleClear = useCallback((onChange: (value: null) => void) => {
        onChange(null);
        onValueChange?.(undefined);
        setOpen(false);
    }, [onValueChange]);

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error: fieldError } }) => {
                    const parsed = parseValue(value, mode);
                    const showClear = clearable && !disabled && Boolean(parsed);
                    const showCalendarIcon = !(
                        hide_calendar_icon_on_date_range &&
                        mode === "range" &&
                        hasSelectedDateRange(parsed)
                    );
                    return (
                        <div className="relative w-full">
                            <Popover open={open} onOpenChange={setOpen}>
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
                                        <Calendar
                                            locale={locale}
                                            mode="range"
                                            selected={parsed as DateRange | undefined}
                                            onSelect={(next) => handleSelect(next, onChange)}
                                            autoFocus
                                            numberOfMonths={1}
                                            defaultMonth={
                                                (parsed as DateRange | undefined)?.from ?? new Date()
                                            }
                                        />
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
