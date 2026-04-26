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

export function toApiDateString(
    value: Date | string | null | undefined,
    format: "iso" | "dmy" = "iso",
): string | null {
    if (!value) return null;

    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");

        return format === "dmy" ? `${day}-${month}-${year}` : `${year}-${month}-${day}`;
    }

    if (typeof value === "string") {
        if (value.includes("T")) return value.slice(0, 10);
        return value;
    }

    return null;
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

/**
 * Bangladesh mobile: local `01[3-9]XXXXXXXX`, intl `8801[3-9]XXXXXXXX`, or 10 digits `1[3-9]XXXXXXXX`.
 * Accepts optional `+`, `00` prefix, and common separators.
 */
export function isBangladeshMobile(value: string): boolean {
    const d = value.replace(/[\s\-().]/g, "");
    if (!/^\+?\d+$/.test(d)) return false;
    let n = d.startsWith("+") ? d.slice(1) : d;
    if (n.startsWith("00")) n = n.slice(2);
    if (n.length === 13 && n.startsWith("880")) {
        return /^8801[3-9]\d{8}$/.test(n);
    }
    if (n.length === 11) {
        return /^01[3-9]\d{8}$/.test(n);
    }
    if (n.length === 10) {
        return /^1[3-9]\d{8}$/.test(n);
    }
    return false;
}

const HOSTNAME_LABEL = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|xn--[a-z0-9-]+)$/i;

function isPlausibleHostname(hostname: string): boolean {
    if (!hostname || hostname.length > 253) return false;
    const root = hostname.replace(/\.$/, "");
    const parts = root.split(".");
    if (parts.length < 2) return false;
    return parts.every(
        (label) => label.length >= 1 && label.length <= 63 && HOSTNAME_LABEL.test(label),
    );
}

const ISPTIK_COM = "isptik.com";

function isIsptikComHost(hostname: string): boolean {
    const h = hostname.toLowerCase();
    return h === ISPTIK_COM || h.endsWith(`.${ISPTIK_COM}`);
}

/**
 * `http`/`https` only, hostname must be `isptik.com` or `*.isptik.com` (e.g. `https://test.isptik.com/`).
 * Callers should treat empty string as "no website" when the field is optional.
 */
export function isValidHttpDomainUrl(value: string): boolean {
    const t = value.trim();
    if (!t) return false;
    let u: URL;
    try {
        u = new URL(t);
    } catch {
        return false;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname;
    if (!isPlausibleHostname(host)) return false;
    return isIsptikComHost(host);
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

export function resolveApiAssetUrl(value?: string | null): string | null {
    if (!value) return null;
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;
    if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;

    const apiOrigin = (process.env.NEXT_PUBLIC_API ?? process.env.NEXTAPI_URL ?? "")
        .trim()
        .replace(/\/$/, "");

    if (!apiOrigin) return trimmedValue;

    return `${apiOrigin}${trimmedValue.startsWith("/") ? "" : "/"}${trimmedValue}`;
}

export function resolveApiAssetUrlWithFallback(
    value: string | null | undefined,
    fallback: string
): string {
    return resolveApiAssetUrl(value) ?? fallback;
}
