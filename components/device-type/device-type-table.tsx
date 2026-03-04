"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, {
  type PaginatedApiResponse,
} from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { DeviceTypeColumns } from "./device-type-column";
import DeviceTypeForm from "./device-type-form";
import type { DeviceTypeRow } from "./device-type-type";
import { useTranslation } from "react-i18next";

const DeviceTypeTable: FC = () => {
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
    useApiQuery<PaginatedApiResponse<DeviceTypeRow>>({
      queryKey: ["device-types"],
      url: "device-types",
      params,
    });

  const deviceTypes = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const toolbarTitle =
    pagination?.total != null
      ? `${t("device_type.title_plural")} (${pagination.total})`
      : t("device_type.title_plural");

  return (
    <DataTable
      data={deviceTypes}
      setFilter={setFilter}
      columns={DeviceTypeColumns}
      toggleColumns={true}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={DeviceTypeForm}
      toolbarTitle={toolbarTitle}
    />
  );
};

export default DeviceTypeTable;
