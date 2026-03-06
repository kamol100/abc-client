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

type InvoiceLineLike = {
    amount?: number | string | null;
    quantity?: number | string | null;
    discount?: number | string | null;
};

export type InvoiceTotals = {
    sub_total: number;
    line_total_discount: number;
    header_discount: number;
    total_discount: number;
    after_discount_amount: number;
};

export function calculateInvoiceTotals(
    lines: InvoiceLineLike[] = [],
    headerDiscount: number | string | null | undefined = 0,
): InvoiceTotals {
    const subTotal = lines.reduce(
        (sum, line) => sum + toNumber(line.amount) * toNumber(line.quantity || 1),
        0,
    );
    const lineTotalDiscount = lines.reduce(
        (sum, line) => sum + toNumber(line.discount),
        0,
    );
    const headerDiscountAmount = toNumber(headerDiscount);
    const totalDiscount = lineTotalDiscount + headerDiscountAmount;
    const afterDiscountAmount = subTotal - totalDiscount;

    return {
        sub_total: subTotal,
        line_total_discount: lineTotalDiscount,
        header_discount: headerDiscountAmount,
        total_discount: totalDiscount,
        after_discount_amount: afterDiscountAmount,
    };
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

export function cellIndex(rowIndex: number, pagination?: Pagination): number {
    const perPage = pagination?.per_page ?? 20;
    const currentPage = pagination?.current_page ?? 1;
    return (currentPage - 1) * perPage + rowIndex + 1;
}

export function formatKey(key: string): string {
    return key
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
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

export function getCurrentGeolocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
        if (!navigator?.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}
