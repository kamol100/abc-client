"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { usePermissions } from "@/context/app-provider";
import type { PaymentGatewayRow } from "./payment-gateway-type";
import { getPaymentGatewayColumns } from "./payment-gateway-column";
import PaymentGatewayForm from "./payment-gateway-form";

const PaymentGatewayTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<PaymentGatewayRow>>({
      queryKey: ["paymentGateways"],
      url: "payment-gateways",
      params,
    });

  const gateways = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const columns = useMemo(() => getPaymentGatewayColumns(), []);

  const toolbarTitle = pagination?.total
    ? t("payment_gateway.title_plural_count", { count: pagination.total })
    : t("payment_gateway.title_plural");

  return (
    <DataTable
      data={gateways}
      columns={columns}
      setFilter={setFilter}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={
        hasPermission("payment-gateways.create") ? PaymentGatewayForm : undefined
      }
      toolbarTitle={toolbarTitle}
    />
  );
};

export default PaymentGatewayTable;
