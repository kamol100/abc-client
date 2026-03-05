"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { formatMoney } from "@/lib/helper/helper";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FundFilterSchema from "./fund-filter-schema";
import FundForm from "./fund-form";
import { getFundColumns } from "./fund-column";
import { FundReport, FundRow } from "./fund-type";

type FundListPayload = {
  data: FundRow[];
  pagination: Pagination;
  report?: FundReport | null;
  reports?: { total_balance?: number | string } | null;
};

const FundTable: FC = () => {
  const { t } = useTranslation();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<ApiResponse<FundListPayload>>({
      queryKey: ["funds"],
      url: "funds",
      params,
    });

  const funds = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const totalBalance =
    data?.data?.report?.total_balance ??
    data?.data?.reports?.total_balance ??
    0;

  const toolbarTitle = pagination?.total
    ? `${t("fund.title_plural")} (${pagination.total})`
    : t("fund.title_plural");

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
            <p className="text-2xl font-semibold text-primary">
              ৳{formatMoney(totalBalance)}
            </p>
          )}
        </CardContent>
      </Card>

      <DataTable
        data={funds}
        columns={columns}
        setFilter={setFilter}
        toolbarOptions={toolbarOptions}
        toggleColumns
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        isFetching={isFetching}
        queryKey="funds"
        form={FundForm}
        toolbarTitle={toolbarTitle}
      />
    </div>
  );
};

export default FundTable;
