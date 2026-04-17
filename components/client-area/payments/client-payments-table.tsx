"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { toNumber } from "@/lib/helper/helper";
import { DataTable } from "@/components/data-table/data-table";
import Card from "@/components/card";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DisplayCount from "@/components/display-count";
import { useClientPaymentColumns } from "@/components/client-area/payments/client-payment-columns";
import ClientPaymentFilterSchema from "@/components/client-area/payments/client-payment-filter-schema";
import type { ClientPaymentListApiResponse } from "@/components/client-area/payments/client-payment-type";

const ClientPaymentsTable: FC = () => {
  const { t } = useTranslation();
  const columns = useClientPaymentColumns();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(() => {
    if (!filterValue) return undefined;
    return Object.fromEntries(
      new URLSearchParams(filterValue),
    ) as Record<string, string>;
  }, [filterValue]);

  const toolbarOptions = useMemo(
    () => ({ filter: ClientPaymentFilterSchema() }),
    [],
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<ClientPaymentListApiResponse>({
      queryKey: ["client-payments"],
      url: "client-payments",
      params,
    });

  const payments = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const totalPaid = data?.data?.reports?.amount;

  const toolbarTitle = pagination?.total
    ? `${t("payment.title_plural")} (${pagination.total})`
    : t("payment.title_plural");

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {t("payment.total_paid")}
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-2" />
          ) : (
            <DisplayCount
              amount={toNumber(totalPaid)}
              formatCurrency
              className="text-xl font-semibold text-primary"
              animate
              duration={800}
            />
          )}
        </CardContent>
      </Card>

      <DataTable
        data={payments}
        columns={columns}
        toolbarOptions={toolbarOptions}
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading || isFetching}
        isFetching={isFetching}
        setFilter={setFilter}
        queryKey="client-payments"
        toolbarTitle={toolbarTitle}
      />
    </div>
  );
};

export default ClientPaymentsTable;
