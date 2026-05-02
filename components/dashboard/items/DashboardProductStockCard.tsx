"use client";

import Card from "@/components/card";
import DisplayCount from "@/components/display-count";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DashboardProductStockSummarySchema,
  type DashboardProductStockCategory,
} from "@/components/dashboard/dashboard-type";

const DEFAULT_ROW_COUNT = 2;

const CATEGORY_UNITS: Record<string, string> = {
  fiber: "dashboard.product_stock.units.meter",
  onu: "dashboard.product_stock.units.piece",
};

function getCategoryUnit(name: string): string | undefined {
  return CATEGORY_UNITS[name.toLowerCase()];
}

function StockRow({ category, t }: { category: DashboardProductStockCategory; t: (key: string) => string }) {
  const unitKey = getCategoryUnit(category.category_name);
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{t(`common.${String(category?.category_name ?? 'fiber').toLowerCase()}`)}:</span>
      <span className="font-semibold text-foreground">
        <DisplayCount amount={category.total_remaining_stock} />
        {unitKey && <span className="ml-1 font-normal text-muted-foreground">{t(unitKey)}</span>}
      </span>
    </div>
  );
}

function StockCardSkeleton() {
  return (
    <div className="flex h-full flex-col animate-in fade-in duration-300">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-4 min-h-8">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        {Array.from({ length: DEFAULT_ROW_COUNT }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardProductStockCard() {
  const { t } = useTranslation();

  const { data: stockResponse, isLoading, isFetching, isError } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-product-stock-summary"],
    url: "dashboard-product-stock-summary",
    pagination: false,
  });

  const stockData = useMemo(() => {
    const parsed = DashboardProductStockSummarySchema.safeParse(stockResponse?.data);
    return parsed.success
      ? parsed.data
      : { categories: [], total_remaining_stock: 0, total_stock_out: 0 };
  }, [stockResponse?.data]);

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-sm">
      {isLoading || isFetching ? (
        <StockCardSkeleton />
      ) : isError ? (
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
        </div>
      ) : (
        <div className="flex h-full flex-col animate-in fade-in duration-300">
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between gap-4 min-h-8">
              <p className="text-xl font-bold text-foreground">
                {t("dashboard.product_stock.title")}
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                <DisplayCount amount={stockData.total_remaining_stock} />
              </p>
            </div>
          </div>

          <div className="px-4 py-3 space-y-1.5">
            {stockData.categories.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground">{t("common.no_data")}</p>
            ) : (
              stockData.categories.map((category) => (
                <StockRow key={category.category_name} category={category} t={t} />
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
