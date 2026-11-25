/**
 * Rules that show or hide a field from the value of another field (`visibleWhen`).
 * Pure functions: no React, no form state.
 */
import type { FieldRule, VisibleWhen } from "@/components/form-wrapper/form-builder-type";

/** A value the user has filled in. `0` and `false` count as filled; an empty list does not. */
export const hasFilledValue = (value: unknown): boolean => {
    if (value === null || value === undefined || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

/**
 * Whether a rule passes, given the current value of the field it watches.
 *   - `when`   : the rule's own test, used first.
 *   - `equals` : passes while the watched value equals it (compared as text too, so 1 matches "1").
 *   - neither  : passes while the watched field is filled.
 */
export function isRulePassing(rule: FieldRule, watchedValue: unknown): boolean {
    if (rule.when) return rule.when(watchedValue);
    if (rule.equals === undefined) return hasFilledValue(watchedValue);
    return watchedValue === rule.equals || String(watchedValue) === String(rule.equals);
}

/** Whether a field with this `visibleWhen` rule is shown. */
export const isFieldVisible = (visibleWhen: VisibleWhen, watchedValue: unknown): boolean =>
    isRulePassing(visibleWhen, watchedValue);

/** The value written into a field while it is hidden. */
export const hiddenFieldValue = (visibleWhen: VisibleWhen) => visibleWhen.resetValue ?? null;

/**
 * The full form path of a field that a rule names.
 *
 * Inside a row of a field array, a plain name means the field in the same row:
 * `product_id` in row `lines.2` is `lines.2.product_id`. A leading `/` means a
 * top-level field: `/status` is `status`. Outside a row both forms mean the same.
 */
export function resolveFieldPath(rowPath: string | undefined, fieldName: string): string {
    if (fieldName.startsWith("/")) return fieldName.slice(1);
    return rowPath ? `${rowPath}.${fieldName}` : fieldName;
}
