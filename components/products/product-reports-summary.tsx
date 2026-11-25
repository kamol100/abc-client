"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Banknote, Boxes } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { ProductReportSummary } from "@/components/products/product-reports-type";

type ProductReportsSummaryProps = {
    reports?: ProductReportSummary | null;
    isLoading?: boolean;
    className?: string;
};

const ProductReportsSummary: FC<ProductReportsSummaryProps> = ({
    reports,
    isLoading = false,
    className,
}) => {
    const { t } = useTranslation();

    const chips = [
        {
            key: "quantity",
            label: "product_reports.summary.quantity",
            icon: Boxes,
            value: String(toNumber(reports?.quantity)),
        },
        {
            key: "total_price",
            label: "product_reports.summary.total_price",
            icon: Banknote,
            value: `৳${formatMoney(reports?.total_price)}`,
        },
    ];

    // Same chip style as the invoice totals. The amount slot keeps its size while
    // loading, so the toolbar does not move when the numbers arrive.
    return (
        <dl className={cn("flex flex-wrap items-center gap-2", className)}>
            {chips.map(({ key, label, icon: Icon, value }) => (
                <div
                    key={key}
                    className="flex h-9 items-center gap-2 whitespace-nowrap rounded-[var(--radius)] border border-border bg-background px-2.5"
                >
                    <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {t(label)}
                    </dt>
                    <dd className="flex h-5 min-w-16 items-center justify-end text-sm font-semibold tabular-nums">
                        {isLoading ? <Skeleton className="h-4 w-16" /> : value}
                    </dd>
                </div>
            ))}
        </dl>
    );
};

export default ProductReportsSummary;
