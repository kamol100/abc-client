"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Control, Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import type { DateRange, DayPickerLocale } from "react-day-picker";
import { enUS, bn } from "react-day-picker/locale";
import { useTranslation } from "react-i18next";
import Label from "../label";
import { Button } from "../ui/button";
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
    locale?: Partial<DayPickerLocale>;
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
}: DatePickerProps) => {
    const { t, i18n } = useTranslation();
    const language = parseLanguage(i18n.language);
    const locale = language === "en" ? enUS : bn;
    const { control: ctxControl } = useFormContext();
    const control = controlProp ?? ctxControl;
    const rules = rulesProp ?? (required ? { required: "This field is required" } : undefined);
    const [open, setOpen] = useState(false);

    const formatSingle = (date: Date | undefined) =>
        date ? format(date, dateFormat) : null;

    const formatRange = (range: DateRange | undefined) => {
        if (!range?.from) return null;
        const fromStr = format(range.from, rangeDateFormat);
        const toStr = range.to ? format(range.to, rangeDateFormat) : null;
        return toStr ? `${fromStr} – ${toStr}` : fromStr;
    };

    const displayValue = (value: DatePickerValue) =>
        mode === "range"
            ? formatRange(value as DateRange | undefined)
            : formatSingle(value as Date | undefined);

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

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            {label && <Label label={label} />}
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field: { value, onChange, onBlur, ref }, fieldState: { error: fieldError } }) => {
                    const parsed = parseValue(value, mode);
                    return (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    ref={ref}
                                    variant="outline"
                                    onBlur={onBlur}
                                    disabled={disabled}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-background",
                                        !parsed && "text-muted-foreground",
                                        fieldError && "border-destructive"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {displayValue(parsed) ?? t(placeholder)}
                                </Button>
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
                    );
                }}
            />
            <FieldError name={name} />
        </div>
    );
};

export default DatePicker;
