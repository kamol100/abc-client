import { differenceInCalendarDays, format, isValid, parse } from "date-fns";

const DISPLAY_FORMAT = "dd-MMM-yy";

export type ClientTerminationDateDisplay =
    | { kind: "remaining"; date: string; days: number }
    | { kind: "expired"; date: string; days: number }
    | { kind: "unparsed"; text: string };

export function getClientTerminationDateDisplay(
    value: string | null | undefined,
    today: Date = new Date(),
): ClientTerminationDateDisplay | null {
    const trimmed = value?.trim();
    if (!trimmed) return null;

    const date = parseTerminationDate(trimmed);
    if (!date) return { kind: "unparsed", text: trimmed };

    const days = differenceInCalendarDays(date, today);
    const formatted = format(date, DISPLAY_FORMAT);

    if (days < 0) {
        return { kind: "expired", date: formatted, days: Math.abs(days) };
    }

    return { kind: "remaining", date: formatted, days };
}

function parseTerminationDate(value: string): Date | null {
    const iso = parseIsoCalendarDate(value);
    if (iso) return iso;

    const parsed = parse(value, DISPLAY_FORMAT, new Date());
    if (!isValid(parsed)) return null;

    const formatted = format(parsed, DISPLAY_FORMAT);
    if (formatted.toLowerCase() !== value.toLowerCase()) return null;

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function parseIsoCalendarDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
    ) {
        return null;
    }

    return date;
}
