"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import type { ProductMovementMode } from "@/components/products/product-movement-filter-schema";
import { ProductReportSummary } from "@/components/products/product-reports-type";

type ProductReportsSummaryProps = {
    reports?: ProductReportSummary | null;
    mode: ProductMovementMode;
    isLoading?: boolean;
};

const ProductReportsSummary: FC<ProductReportsSummaryProps> = ({
    reports,
    mode,
    isLoading = false,
}) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    const currentQuantity =
        mode === "in"
            ? toNumber(reports?.product_in_current_quantity)
            : toNumber(reports?.product_out_current_quantity);
    const currentPrice =
        mode === "in"
            ? toNumber(reports?.product_in_current_total_price)
            : toNumber(reports?.product_out_current_total_price);

    const cards = [
        {
            label: t("product_reports.summary.actual_quantity"),
            value: String(toNumber(reports?.actual_quantity)),
        },
        {
            label: t("product_reports.summary.actual_price"),
            value: `৳${formatMoney(reports?.actual_total_price)}`,
        },
        {
            label: t("product_reports.summary.current_quantity"),
            value: String(currentQuantity),
        },
        {
            label: t("product_reports.summary.current_price"),
            value: `৳${formatMoney(currentPrice)}`,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.label}>
                    <CardContent className="p-4 space-y-1">
                        <p className="text-xs text-muted-foreground">{card.label}</p>
                        <p className="text-xl font-semibold">{card.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ProductReportsSummary;
