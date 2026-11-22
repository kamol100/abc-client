"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Landmark } from "lucide-react";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import FundFilterSchema from "@/components/funds/fund-filter-schema";
import FundForm from "@/components/funds/fund-form";
import { getFundColumns } from "@/components/funds/fund-column";
import { FundReport, FundRow } from "@/components/funds/fund-type";
import DisplayCount from "@/components/display-count";
import MyButton from "@/components/my-button";
import { toNumber } from "@/lib/helper/helper";

type FundListPayload = {
  data: FundRow[];
  pagination: Pagination;
  report?: FundReport | null;
  reports?: { total_balance?: number | string } | null;
};

type FundTableProps = {
  toolbarTitleKey?: string;
  showCreateAction?: boolean;
};

const FundTable: FC<FundTableProps> = ({
  toolbarTitleKey = "fund.title_plural",
  showCreateAction = true,
}) => {
  const { t } = useTranslation();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, isError, refetch, setCurrentPage } =
    useApiQuery<ApiResponse<FundListPayload>>({
      queryKey: ["funds"],
      url: "funds",
      params,
    });

  const funds = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  useEffect(() => {
    if (pagination && pagination.current_page > Math.max(1, pagination.total_pages)) {
      setCurrentPage(1);
    }
  }, [pagination, setCurrentPage]);

  const totalBalance =
    data?.data?.report?.total_balance ??
    data?.data?.reports?.total_balance ??
    0;

  const toolbarTitle = pagination?.total
    ? `${t(toolbarTitleKey)} (${pagination.total})`
    : t(toolbarTitleKey);

  const toolbarOptions = useMemo(
    () => ({
      filter: FundFilterSchema(),
      watchFields: ["name", "account_number"],
    }),
    []
  );

  const columns = useMemo(() => getFundColumns(() => pagination), [pagination]);

  return (
    <div className="space-y-4">
      {isError && (
        <div role="alert" className="flex min-h-10 items-center gap-2 text-destructive">
          <span>{t("fund.load_error")}</span>
          <MyButton onClick={() => void refetch()}>{t("fund.retry")}</MyButton>
        </div>
      )}
      <DataTable
        data={funds}
        columns={columns}
        setFilter={setFilter}
        toolbar={{
          title: toolbarTitle,
          center: [
            {
              key: "balance",
              node: (
                // Same chip as the navbar wallet balance. The amount box keeps its
                // width, so swapping the skeleton for the amount does not move the toolbar.
                <div className="flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--radius)] border border-border bg-background px-2.5">
                  <Landmark className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-xs text-muted-foreground">{t("fund.balance.label")}</span>
                  <span className="inline-flex min-w-16 items-center justify-end text-sm font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      <DisplayCount amount={toNumber(totalBalance)} formatCurrency animate currency="BDT" />
                    )}
                  </span>
                </div>
              ),
            },
          ],
          features: {
            columns: true,
            filter: toolbarOptions,
            add: showCreateAction ? FundForm : undefined,
          },
        }}
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        isFetching={isFetching}
        queryKey="funds"
      />
    </div>
  );
};

export default FundTable;
