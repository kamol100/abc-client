"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
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

    if (isLoading) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-muted px-3">
                <span className="text-xs text-muted-foreground">
                    {t("product_reports.summary.quantity")}
                </span>
                <span className="text-sm font-medium tabular-nums">
                    {toNumber(reports?.quantity)}
                </span>
            </div>
            <div className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-muted px-3">
                <span className="text-xs text-muted-foreground">
                    {t("product_reports.summary.total_price")}
                </span>
                <span className="text-sm font-medium tabular-nums">
                    ৳{formatMoney(reports?.total_price)}
                </span>
            </div>
        </div>
    );
};

export default ProductReportsSummary;
