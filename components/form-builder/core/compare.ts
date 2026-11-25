/**
 * Comparing form values. Pure functions.
 */

const isEmpty = (value: unknown): boolean => value === undefined || value === null || value === "";

/**
 * Equal as form values: ids compare as text (3 and "3"), empty values are all alike
 * (null, undefined, ""), and lists compare item by item.
 */
export function sameFormValue(left: unknown, right: unknown): boolean {
    if (Array.isArray(left) || Array.isArray(right)) {
        return (
            Array.isArray(left) &&
            Array.isArray(right) &&
            left.length === right.length &&
            left.every((item, index) => sameFormValue(item, right[index]))
        );
    }
    if (isEmpty(left) || isEmpty(right)) return isEmpty(left) && isEmpty(right);
    return String(left) === String(right);
}
