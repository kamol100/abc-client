/**
 * Rules that show or hide a field from the value of another field (`visibleWhen`).
 * Pure functions: no React, no form state.
 */
import type { VisibleWhen } from "@/components/form-wrapper/form-builder-type";

/** A value the user has filled in. `0` and `false` count as filled; an empty list does not. */
export const hasFilledValue = (value: unknown): boolean => {
    if (value === null || value === undefined || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

/**
 * Whether the field is shown, given the current value of the field it watches.
 *   - `when`   : the rule's own test, used first.
 *   - `equals` : shown while the watched value equals it (compared as text too, so 1 matches "1").
 *   - neither  : shown while the watched field is filled.
 */
export function isFieldVisible(visibleWhen: VisibleWhen, watchedValue: unknown): boolean {
    if (visibleWhen.when) return visibleWhen.when(watchedValue);
    if (visibleWhen.equals === undefined) return hasFilledValue(watchedValue);
    return (
        watchedValue === visibleWhen.equals ||
        String(watchedValue) === String(visibleWhen.equals)
    );
}

/** The value written into a field while it is hidden. */
export const hiddenFieldValue = (visibleWhen: VisibleWhen) => visibleWhen.resetValue ?? null;
