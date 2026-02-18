export function groupBy<T>(items: T[], keyGetter: (item: T) => string): Record<string, T[]> {
    const result: Record<string, T[]> = {};
    for (const item of items) {
        const key = keyGetter(item);
        result[key] ??= [];
        result[key].push(item);
    }
    return result;
}

export function objectToQueryString(params: Record<string, unknown>): string {
    return Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                return value.length > 0 ? `${key}=[${value.join(",")}]` : "";
            }
            return `${key}=${value}`;
        })
        .filter(Boolean)
        .join("&");
}

export function chunk<T>(array: T[], size: number): T[][] {
    if (!array.length) return [];
    return [array.slice(0, size), ...chunk(array.slice(size), size)];
}

export function numberToArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
}

export function toNumber(value: number | string | null | undefined): number {
    if (value == null) return 0;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
}

export function formatMoney(
    value: number | string | null | undefined,
    minimumFractionDigits = 0,
): string {
    return new Intl.NumberFormat("en", { minimumFractionDigits }).format(toNumber(value));
}

interface ApiErrorShape {
    response?: {
        data?: {
            error?: {
                message?: string;
                error?: { message?: string };
            };
        };
    };
    error?: { message?: string };
    message?: string;
}

export function parseApiError(error: unknown): string | false {
    const err = error as ApiErrorShape;
    return (
        err?.response?.data?.error?.error?.message ??
        err?.response?.data?.error?.message ??
        err?.error?.message ??
        err?.message ??
        false
    );
}
