/**
 * Reading and showing date picker values. Pure functions: no React.
 */
import { format, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";

export type DatePickerMode = "single" | "range";

export type DatePickerValue = Date | DateRange | undefined;

const RANGE_SEPARATOR = " - ";

const pad2 = (value: number) => String(value).padStart(2, "0");

/** "HH:mm" for an <input type="time">. */
export const toTimeInputValue = (date: Date | undefined) =>
    date ? `${pad2(date.getHours())}:${pad2(date.getMinutes())}` : "";

/** The day from `day`, the hours/minutes from `time` (seconds cleared). */
export const withTime = (day: Date, time: Date | undefined): Date => {
    const next = new Date(day);
    next.setHours(time ? time.getHours() : 0, time ? time.getMinutes() : 0, 0, 0);
    return next;
};

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

/** The text on the picker button, or null when nothing is picked. */
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

/** True for a range that spans more than one day. */
export const hasSelectedDateRange = (value: DatePickerValue): boolean => {
    if (!value || value instanceof Date || !value.from || !value.to) return false;
    return !isSameDay(value.from, value.to);
};

export const isCompleteDateRange = (
    range: DateRange | undefined,
): range is DateRange & { from: Date; to: Date } =>
    Boolean(range?.from && range.to && !isSameDay(range.from, range.to));

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A `Date` from a `Date` or a string. "2026-11-25" is read as that day in local time. */
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

/** The picked day from whatever the form holds: a `Date`, a date string, or nothing. */
export const parseSingleDate = (value: unknown): Date | undefined => {
    if (value == null || value === "") return undefined;
    if (value instanceof Date || typeof value === "string") {
        return parseCalendarDate(value);
    }
    return undefined;
};

/** The picked range from whatever the form holds. No range without a `from`. */
export const parseDateRange = (value: unknown): DateRange | undefined => {
    if (value == null || value === "") return undefined;
    const range = value as { from?: string | Date; to?: string | Date };
    const from = range?.from ? parseCalendarDate(range.from) : undefined;
    const to = range?.to ? parseCalendarDate(range.to) : undefined;
    if (!from) return undefined;
    return { from, to };
};
