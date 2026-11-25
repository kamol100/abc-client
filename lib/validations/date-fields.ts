/**
 * Zod fields for a date picked in a form and sent to the API as date-only text
 * ("2026-11-25", the local day).
 *
 * The form holds a `Date`; a record loaded for editing may hold the API's string.
 * Both are accepted and turned into the same text.
 */
import { z } from "zod";
import { normalizeDateOnlyInput } from "@/lib/helper/helper";

/** A date that may be left empty. An empty value is left out of the payload. */
export const optionalDateOnly = z.preprocess(normalizeDateOnlyInput, z.string().optional());

/** A date that may be left empty. An empty value is sent as `null`. */
export const nullableDateOnly = z.preprocess((value) => {
    const normalized = normalizeDateOnlyInput(value);
    return typeof normalized === "string" ? normalized : null;
}, z.string().nullable());
