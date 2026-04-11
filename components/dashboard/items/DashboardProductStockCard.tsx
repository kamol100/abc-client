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

function StockRow({ category }: { category: DashboardProductStockCategory }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="font-medium capitalize text-foreground">{category.category_name}</span>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">
          {t("dashboard.product_stock.remaining")}:{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-500">
            <DisplayCount amount={category.total_remaining_stock} />
          </span>
        </span>
        <span className="text-xs text-muted-foreground">
          {t("dashboard.product_stock.stock_out")}:{" "}
          <span className="font-semibold text-rose-600 dark:text-rose-500">
            <DisplayCount amount={category.total_stock_out} />
          </span>
        </span>
      </div>
    </div>
  );
}

function StockCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="flex flex-1 flex-col p-4">
        <div className="min-h-6">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="divide-y">
          {Array.from({ length: DEFAULT_ROW_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-5 w-16" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t bg-muted/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
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
            <div className="min-h-6">
              <p className="text-sm font-medium text-muted-foreground">
                {t("dashboard.product_stock.title")}
              </p>
            </div>

            <div className="divide-y">
              {stockData.categories.map((category) => (
                <StockRow key={category.category_name} category={category} />
              ))}
              {stockData.categories.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  {t("common.no_data")}
                </p>
              )}
            </div>
          </div>

          <div className="border-t bg-muted/40 px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">
                  {t("dashboard.product_stock.total_remaining")}:
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                  <DisplayCount amount={stockData.total_remaining_stock} />
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">
                  {t("dashboard.product_stock.total_stock_out")}:
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-500">
                  <DisplayCount amount={stockData.total_stock_out} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
