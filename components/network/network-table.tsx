"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { NetworkColumns } from "./network-column";
import NetworkFilterSchema from "./network-filter-schema";
import NetworkForm from "./network-form";
import { NetworkRow } from "./network-type";

const NetworkTable: FC = () => {
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
    useApiQuery<PaginatedApiResponse<NetworkRow>>({
      queryKey: ["networks"],
      url: "networks",
      params,
    });

  const networks = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const canCreate = hasPermission("networks.create");

  const toolbarTitle = pagination?.total
    ? `${t("network.title_plural")} (${pagination.total})`
    : t("network.title_plural");

  return (
    <DataTable
      data={networks}
      setFilter={setFilter}
      columns={NetworkColumns}
      toolbarOptions={{ filter: NetworkFilterSchema() }}
      toggleColumns={true}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={canCreate ? NetworkForm : undefined}
      toolbarTitle={toolbarTitle}
      queryKey="networks"
    />
  );
};

export default NetworkTable;
