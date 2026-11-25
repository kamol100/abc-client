/**
 * Reading dates that come from the API. Pure functions.
 */

/** A `Date` from an API value. A string is read with `new Date(string)`. */
export const parseDateValue = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    return undefined;
};

/** A `{ from, to }` range of `Date`s from an API value. No range without a `from`. */
export const parseDateRangeValue = (value: unknown): { from: Date; to?: Date } | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const range = value as { from?: unknown; to?: unknown };
    const from = parseDateValue(range.from);
    if (!from) return undefined;
    return { from, to: parseDateValue(range.to) ?? undefined };
};
