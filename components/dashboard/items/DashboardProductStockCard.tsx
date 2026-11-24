"use client";

import { DashboardStatCard, DashboardStatRow } from "@/components/dashboard/items/DashboardAccentCard";
import { DASHBOARD_CARD_ACCENTS, type DashboardCardAccent } from "@/components/dashboard/dashboard-constants";
import DisplayCount from "@/components/display-count";
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
    <DashboardStatRow
      label={t(`common.${String(category?.category_name ?? "fiber").toLowerCase()}`)}
      value={
        <>
          <DisplayCount amount={category.total_remaining_stock} />
          {unitKey && <span className="ml-1 font-normal text-muted-foreground">{t(unitKey)}</span>}
        </>
      }
    />
  );
}

export default function DashboardProductStockCard({
  accent = DASHBOARD_CARD_ACCENTS.productStock,
}: {
  accent?: DashboardCardAccent;
}) {
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
    <DashboardStatCard
      accent={accent}
      label={t("dashboard.product_stock.title")}
      value={<DisplayCount amount={stockData.total_remaining_stock} />}
      isLoading={isLoading || isFetching}
      isError={isError}
      skeletonRows={DEFAULT_ROW_COUNT}
    >
      {stockData.categories.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground">{t("common.no_data")}</p>
      ) : (
        stockData.categories.map((category) => (
          <StockRow key={category.category_name} category={category} t={t} />
        ))
      )}
    </DashboardStatCard>
  );
}
