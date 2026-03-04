"use client";

import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { usePermissions } from "@/context/app-provider";
import type { CommunicationGatewayRow } from "./communication-gateway-type";
import { getCommunicationGatewayColumns } from "./communication-gateway-column";
import CommunicationGatewayForm from "./communication-gateway-form";

const CommunicationGatewayTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<CommunicationGatewayRow>>({
      queryKey: ["communicationGateways"],
      url: "communication-gateways",
    });

  const gateways = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const columns = useMemo(() => getCommunicationGatewayColumns(), []);

  const toolbarTitle = pagination?.total
    ? t("communication_gateway.title_plural_count", { count: pagination.total })
    : t("communication_gateway.title_plural");

  return (
    <DataTable
      data={gateways}
      columns={columns}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={
        hasPermission("communication-gateways.create")
          ? CommunicationGatewayForm
          : undefined
      }
      toolbarTitle={toolbarTitle}
    />
  );
};

export default CommunicationGatewayTable;
