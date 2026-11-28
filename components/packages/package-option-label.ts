import { formatMoney } from "@/lib/helper/helper";

/**
 * The label of a package in a dropdown: its name, then its speed and price when the
 * API sent them, e.g. "Home 10 — 10 Mbps · ৳500".
 */
export function packageOptionLabel(record: Record<string, unknown>): string | null {
    const { name, bandwidth, price } = record;
    if (typeof name !== "string") return null;

    const details: string[] = [];
    if (typeof bandwidth === "string" && bandwidth.trim() !== "") details.push(bandwidth.trim());
    if (typeof price === "number" || (typeof price === "string" && price !== "")) {
        details.push(`৳${formatMoney(price)}`);
    }

    return details.length ? `${name} — ${details.join(" · ")}` : name;
}
