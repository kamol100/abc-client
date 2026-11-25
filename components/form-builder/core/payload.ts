/**
 * Turns the values of a submitted form into the body of the API request.
 * Pure functions: no React, no form state.
 */
import type { FieldValues } from "react-hook-form";
import { sanitizeServerActionPayload } from "@/lib/helper/server-action-payload";

export type PayloadSteps = {
    /** The caller's own change to the values, e.g. dropping a key the API does not take. */
    transformPayload?: (values: FieldValues) => FieldValues;
    /** Fixed values added to every submit. They win over a form value with the same key. */
    extraPayload?: Record<string, unknown>;
};

/**
 * The request body for validated form values:
 *   1. the caller's `transformPayload`,
 *   2. `extraPayload` merged on top,
 *   3. cleanup of values a Server Action cannot carry (undefined keys).
 */
export function buildPayload(values: FieldValues, steps: PayloadSteps): FieldValues {
    const { transformPayload, extraPayload } = steps;
    const transformed = transformPayload ? transformPayload(values) : values;
    const merged =
        extraPayload && Object.keys(extraPayload).length > 0
            ? ({ ...transformed, ...extraPayload } as FieldValues)
            : transformed;
    return sanitizeServerActionPayload(merged);
}

/** The payload as multipart form data. Every value is sent as text. */
export function toFormData(payload: FieldValues): FormData {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value as string);
    });
    return formData;
}
