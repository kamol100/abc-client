const DAYS_PER_MONTH = 30;

export function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

export function parsePositiveAmount(
    value: number | string | null | undefined,
): number | null {
    if (typeof value === "string" && value.trim() === "") return null;
    if (value == null) return null;

    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
}

export function calculateRechargeCost(
    buyingPrice: number | string | null | undefined,
    days: number | string | null | undefined,
): number | null {
    const price = parsePositiveAmount(buyingPrice);
    const dayCount = parsePositiveAmount(days);
    if (price == null || dayCount == null) return null;

    const cost = (price / DAYS_PER_MONTH) * dayCount;
    return Number.isFinite(cost) ? roundMoney(cost) : null;
}

export function calculateClientRechargeBalance(
    packagePrice: number | string | null | undefined,
    days: number | string | null | undefined,
): number | null {
    const price = parsePositiveAmount(packagePrice);
    const dayCount = parsePositiveAmount(days);
    if (price == null || dayCount == null) return null;

    const balance = (price / DAYS_PER_MONTH) * dayCount;
    return Number.isFinite(balance) ? roundMoney(balance) : null;
}

export function hasSufficientWalletBalance(
    cost: number | null,
    walletBalance: number | null | undefined,
): boolean {
    if (cost == null || walletBalance == null || !Number.isFinite(walletBalance)) {
        return false;
    }

    return cost <= roundMoney(walletBalance);
}
