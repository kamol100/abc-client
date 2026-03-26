"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { CardContent } from "@/components/ui/card";
import Card from "@/components/card";
import { Skeleton } from "@/components/ui/skeleton";
import FundFilterSchema from "./fund-filter-schema";
import FundForm from "./fund-form";
import { getFundColumns } from "./fund-column";
import { FundReport, FundRow } from "./fund-type";
import DisplayCount from "../display-count";
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
        form={showCreateAction ? FundForm : undefined}
        toolbarTitle={toolbarTitle}
      />
    </div>
  );
};

export default FundTable;
