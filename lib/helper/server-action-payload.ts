export function sanitizeServerActionPayload<T>(value: T): T {
    if (value === "$undefined") {
        return null as T;
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeServerActionPayload(item)) as T;
    }

    if (value instanceof Date || (typeof FormData !== "undefined" && value instanceof FormData)) {
        return value;
    }

    if (value !== null && typeof value === "object") {
        const sanitized: Record<string, unknown> = {};
        for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
            if (item === undefined) continue;
            sanitized[key] = sanitizeServerActionPayload(item);
        }
        return sanitized as T;
    }

    return value;
}
