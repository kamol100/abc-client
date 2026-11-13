import { parseApiError } from "@/lib/helper/helper";

/** A failed API envelope. The message stays compatible with existing Error checks. */
export class ApiRequestError extends Error {
    readonly status?: number;
    readonly code?: string;

    constructor(message: string, status?: number, code?: string) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
        this.code = code;
    }
}

export function apiRequestError(response: unknown): ApiRequestError {
    const message = parseApiError(response);
    const body = response && typeof response === "object"
        ? response as { status?: unknown; error?: { code?: unknown } }
        : {};
    const status = typeof body.status === "number" ? body.status : undefined;
    const code = typeof body.error?.code === "string" ? body.error.code : undefined;
    const text = typeof message === "string" && message !== "" ? message : "Request failed";
    return new ApiRequestError(text, status, code);
}
