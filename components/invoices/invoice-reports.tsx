"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { BadgePercent, CircleCheck, Receipt, Sigma, type LucideIcon } from "lucide-react";
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
     * "toolbar": in the table toolbar's center. One row from 1440px, an even
     * 2x2 grid below that, so the toolbar never wraps raggedly.
     */
    layout?: "block" | "toolbar";
};

type Stat = {
    key: keyof InvoiceReportsType;
    label: string;
    icon: LucideIcon;
    tone?: string;
};

const STATS: Stat[] = [
    { key: "total_amount", label: "invoice.reports.sub_total", icon: Receipt },
    { key: "discount", label: "invoice.reports.discount", icon: BadgePercent },
    { key: "after_discount_amount", label: "invoice.reports.total", icon: Sigma },
    { key: "amount_paid", label: "invoice.reports.paid", icon: CircleCheck, tone: "text-success" },
];

/**
 * Invoice totals as chips, the same style as the navbar wallet balance.
 * Desktop: one row of h-9 chips. Phones: a 2x2 grid, label above the amount.
 * The amount slot keeps its size while loading, so the list below does not move.
 */
const InvoiceReports: FC<Props> = ({ reports, isLoading = false, layout = "block" }) => {
    const { t } = useTranslation();

    return (
        <dl
            className={cn(
                "grid grid-cols-2 gap-2",
                layout === "block" && "sm:flex sm:flex-wrap sm:items-center",
                layout === "toolbar" && "w-full min-[1440px]:flex min-[1440px]:w-auto min-[1440px]:items-center",
            )}
        >
            {STATS.map(({ key, label, icon: Icon, tone }) => (
                <div
                    key={key}
                    className="flex min-w-0 flex-col gap-0.5 rounded-[var(--radius)] border border-border bg-background px-2.5 py-1.5 sm:h-9 sm:flex-row sm:items-center sm:gap-2 sm:whitespace-nowrap sm:py-0"
                >
                    <dt className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <Icon className={cn("size-4 shrink-0", tone)} aria-hidden />
                        <span className="truncate">{t(label)}</span>
                    </dt>
                    <dd className={cn("flex h-5 min-w-16 items-center text-sm font-semibold sm:justify-end", tone)}>
                        {isLoading ? (
                            <Skeleton className="h-4 w-16" />
                        ) : (
                            <DisplayCount
                                amount={toNumber(reports?.[key])}
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
