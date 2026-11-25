/**
 * Which URL and HTTP method a form uses to load and to save a record.
 * Pure functions: no React, no form state.
 */

type FormMode = "create" | "edit";
type FormMethod = "GET" | "POST" | "PUT";

/** The id of the record being edited, read from the form's `data`. */
export const entityIdOf = (data?: Record<string, unknown>): string | number | undefined =>
    (data as { id?: string | number } | undefined)?.id;

const stripLeadingSlash = (path: string): string =>
    path.startsWith("/") ? path.slice(1) : path;

/** Where an edit form loads its record from: `{api}/{id}`. Empty when there is no api. */
export const detailUrlOf = (api: string | undefined, entityId: string | number | undefined): string =>
    api ? `${stripLeadingSlash(api)}/${entityId}` : "";

/**
 * Where a form saves to.
 *   - edit   : always `PUT {api}/{id}`, whatever `method` says.
 *   - create : `{method} {api}`, with GET treated as POST.
 */
export function saveRequestOf(options: {
    api?: string;
    mode: FormMode;
    method: FormMethod;
    entityId?: string | number;
}): { url: string; method: "POST" | "PUT" } {
    const { api, mode, method, entityId } = options;
    if (mode === "edit") {
        return { url: `${api}/${entityId}`, method: "PUT" };
    }
    return { url: `${api}`, method: method === "GET" ? "POST" : method };
}
