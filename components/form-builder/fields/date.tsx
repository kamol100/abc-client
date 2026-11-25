import DatePicker from "@/components/form/DatePicker";
import { parseDateRangeValue, parseDateValue } from "@/components/form-builder/core/dates";
import {
    defineField,
    DROP_VALUE,
    KEEP_VALUE,
    type FilterFieldProps,
} from "@/components/form-builder/fields/define-field";
import type {
    DateFieldConfig,
    DateRangeFieldConfig,
} from "@/components/form-wrapper/form-builder-type";
import { toApiDateString } from "@/lib/helper/helper";

/** A date as the API's date-only text, or undefined when it is not a date. */
function toDateParam(value: unknown): string | undefined {
    if (value instanceof Date) return toApiDateString(value) ?? undefined;
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return toApiDateString(trimmed) ?? undefined;
}

const renderDateFilter = ({
    field,
    onValueChange,
}: FilterFieldProps<DateFieldConfig | DateRangeFieldConfig>) => (
    <DatePicker
        name={field.name}
        placeholder={field.placeholder}
        mode={field.type === "dateRange" ? "range" : "single"}
        closeOnSelectDate={field.closeOnSelectDate}
        onValueChange={onValueChange}
    />
);

/** One date. The API sends a string; the form holds a `Date`. */
export const dateField = defineField<DateFieldConfig>({
    types: ["date"],
    render: ({ field, name }) => (
        <DatePicker
            name={name}
            label={field.label}
            placeholder={field.placeholder}
            mode="single"
            dateFormat={field.dateFormat}
            closeOnSelectDate={field.closeOnSelectDate}
            disabled={field.disabled}
        />
    ),
    readValue: (field, record) =>
        parseDateValue(record[field.valueKey ?? field.name]) ?? KEEP_VALUE,
    renderFilter: renderDateFilter,
    toFilterParam: (value) => toDateParam(value) ?? KEEP_VALUE,
});

/** A from/to pair of dates. In a filter it is sent as `from,to`. */
export const dateRangeField = defineField<DateRangeFieldConfig>({
    types: ["dateRange"],
    render: ({ field, name }) => (
        <DatePicker
            name={name}
            label={field.label}
            placeholder={field.placeholder}
            mode="range"
            dateFormat={field.dateFormat}
            rangeDateFormat={field.dateFormat}
            closeOnSelectDate={field.closeOnSelectDate}
            disabled={field.disabled}
        />
    ),
    readValue: (field, record) =>
        parseDateRangeValue(record[field.valueKey ?? field.name]) ?? KEEP_VALUE,
    renderFilter: renderDateFilter,
    toFilterParam: (value) => {
        if (typeof value === "string") return KEEP_VALUE;
        if (typeof value !== "object" || value === null) return KEEP_VALUE;

        const from = toDateParam((value as { from?: unknown }).from);
        const to = toDateParam((value as { to?: unknown }).to);
        if (from && to) return `${from},${to}`;
        if (from) return from;
        return DROP_VALUE;
    },
});
