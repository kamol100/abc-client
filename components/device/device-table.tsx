"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import DeviceFilterSchema from "./device-filter-schema";
import DeviceForm from "./device-form";
import { useDeviceColumns } from "./device-column";
import { DeviceRow } from "./device-type";

const DeviceTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [filterValue, setFilter] = useState<string | null>(null);
  const columns = useDeviceColumns();

  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<DeviceRow>>({
      queryKey: ["devices"],
      url: "devices",
      params,
    });

  const devices = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const canCreate = hasPermission("devices.create");

  const toolbarTitle = pagination?.total
    ? `${t("device.title_plural")} (${pagination.total})`
    : t("device.title_plural");

  return (
    <DataTable
      data={devices}
      setFilter={setFilter}
      columns={columns}
      toolbarOptions={{ filter: DeviceFilterSchema() }}
      toggleColumns={true}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={canCreate ? DeviceForm : undefined}
      toolbarTitle={toolbarTitle}
      queryKey="devices"
    />
  );
};

export default DeviceTable;
