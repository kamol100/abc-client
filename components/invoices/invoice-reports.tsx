"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { BadgePercent, CircleAlert, CircleCheck, Receipt, Sigma, Wallet, type LucideIcon } from "lucide-react";
import { toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import DisplayCount from "@/components/display-count";
import type { InvoiceReports as InvoiceReportsType } from "@/components/invoices/invoice-type";

type Props = {
    reports?: InvoiceReportsType | null;
    isLoading?: boolean;
    /**
     * "block" (default): its own row above a table, chips in one wrapping row.
     * "toolbar": in the table toolbar's center, sized by `density`.
     */
    layout?: "block" | "toolbar";
    /**
     * Toolbar layout only. The invoice table picks it from the room the toolbar has:
     * "full": one row. "compact": one row without the icons. "tight": the same with
     * less padding. "grid": two columns (phones, or when even "tight" does not fit).
     */
    density?: InvoiceReportsDensity;
    /**
     * The client's wallet balance, shown as a last "Advance Payment" chip. Only the
     * client view passes it; without it the chip is not there.
     */
    advancePayment?: number | string | null;
};

export type InvoiceReportsDensity = "full" | "compact" | "tight" | "grid";

type Stat = {
    key: string;
    label: string;
    icon: LucideIcon;
    tone?: string;
    amount: (reports: InvoiceReportsType | null | undefined) => number;
};

/** What is still to be collected: the total after discount minus what was paid. */
export const invoiceReportsDue = (reports: InvoiceReportsType | null | undefined): number =>
    Math.max(0, toNumber(reports?.after_discount_amount) - toNumber(reports?.amount_paid));

const STATS: Stat[] = [
    { key: "total_amount", label: "invoice.reports.sub_total", icon: Receipt, amount: (r) => toNumber(r?.total_amount) },
    { key: "discount", label: "invoice.reports.discount", icon: BadgePercent, amount: (r) => toNumber(r?.discount) },
    { key: "after_discount_amount", label: "invoice.reports.total", icon: Sigma, amount: (r) => toNumber(r?.after_discount_amount) },
    { key: "amount_paid", label: "invoice.reports.paid", icon: CircleCheck, tone: "text-success", amount: (r) => toNumber(r?.amount_paid) },
    { key: "due", label: "invoice.reports.due", icon: CircleAlert, tone: "text-destructive", amount: invoiceReportsDue },
];

/**
 * Invoice totals as chips, the same style as the navbar wallet balance.
 * Desktop: one row of h-9 chips. Phones: a two-column grid, label above the amount;
 * with an odd number of chips the last one takes the full row.
 * The amount slot keeps its size while loading, so the list below does not move.
 */
const InvoiceReports: FC<Props> = ({ reports, isLoading = false, layout = "block", density = "grid", advancePayment }) => {
    const { t } = useTranslation();
    const stats: Stat[] =
        advancePayment === undefined
            ? STATS
            : [
                ...STATS,
                {
                    key: "advance_payment",
                    label: "invoice.reports.advance_payment",
                    icon: Wallet,
                    tone: "text-primary",
                    amount: () => toNumber(advancePayment),
                },
            ];
    const oddCount = stats.length % 2 === 1;
    // One row in the toolbar: never wraps; the invoice table steps the density down instead.
    const row = layout === "toolbar" && density !== "grid";
    const noIcons = row && density !== "full";
    const tight = row && density === "tight";

    return (
        <dl
            className={cn(
                row ? cn("flex items-center", tight ? "gap-1" : noIcons ? "gap-1.5" : "gap-2") : "grid grid-cols-2 gap-2",
                layout === "block" && "sm:flex sm:flex-wrap sm:items-center",
                layout === "toolbar" && !row && "w-full",
            )}
        >
            {stats.map(({ key, label, icon: Icon, tone, amount }) => (
                <div
                    key={key}
                    className={cn(
                        "flex min-w-0 flex-col gap-0.5 rounded-[var(--radius)] border border-border bg-background py-1.5 sm:h-9 sm:flex-row sm:items-center sm:whitespace-nowrap sm:py-0",
                        tight ? "px-1.5 sm:gap-1" : noIcons ? "px-2 sm:gap-1.5" : "px-2.5 sm:gap-2",
                        !row && oddCount && "last:col-span-2",
                    )}
                >
                    <dt className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        {!noIcons && <Icon className={cn("size-4 shrink-0", tone)} aria-hidden />}
                        <span className="truncate">{t(label)}</span>
                    </dt>
                    <dd className={cn("flex h-5 items-center text-sm font-semibold sm:justify-end", !noIcons && "min-w-16", tone)}>
                        {isLoading ? (
                            <Skeleton className="h-4 w-16" />
                        ) : (
                            <DisplayCount
                                amount={amount(reports)}
                                formatCurrency
                                currency="BDT"
                                animate
                                duration={800}
                            />
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
};

export default InvoiceReports;
