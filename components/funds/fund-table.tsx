"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { CardContent } from "@/components/ui/card";
import Card from "@/components/card";
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
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{t("fund.balance.label")}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-2" />
          ) : (
            <div className="text-lg font-semibold text-primary">
              <DisplayCount amount={toNumber(totalBalance)} formatCurrency animate currency="BDT" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="min-h-10">
        {isError && (
          <div role="alert" className="flex items-center gap-2 text-destructive">
            <span>{t("fund.load_error")}</span>
            <MyButton onClick={() => void refetch()}>{t("fund.retry")}</MyButton>
          </div>
        )}
      </div>
      <DataTable
        data={funds}
        columns={columns}
        setFilter={setFilter}
        toolbar={{
          title: toolbarTitle,
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
