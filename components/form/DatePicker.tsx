"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Control, Controller, FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import type { DateRange } from "react-day-picker";
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
    dateFormat = "PPP",
    rangeDateFormat = "PPP",
    control: controlProp,
    rules: rulesProp,
}: DatePickerProps) => {
    const { control: ctxControl } = useFormContext();
    const control = controlProp ?? ctxControl;
    const rules = rulesProp ?? (required ? { required: "This field is required" } : undefined);

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
                        <Popover>
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
                                    {displayValue(parsed) ?? placeholder}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                {mode === "range" ? (
                                    <Calendar
                                        mode="range"
                                        selected={parsed as DateRange | undefined}
                                        onSelect={onChange}
                                        autoFocus
                                        numberOfMonths={1}
                                        defaultMonth={
                                            (parsed as DateRange | undefined)?.from ?? new Date()
                                        }
                                    />
                                ) : (
                                    <Calendar
                                        mode="single"
                                        selected={parsed as Date | undefined}
                                        onSelect={onChange}
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
