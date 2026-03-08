"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { useMikrotikPackageColumns } from "@/components/mikrotik-packages/mikrotik-package-column";
import MikrotikPackageFilterSchema from "@/components/mikrotik-packages/mikrotik-package-filter-schema";
import { MikrotikPackageRow } from "@/components/mikrotik-packages/mikrotik-package-type";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import MikrotikPackagesToolbarActions from "@/components/mikrotik-packages/mikrotik-packages-toolbar-actions";

const MikrotikPackagesTable: FC = () => {
  const { t } = useTranslation();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching } = useApiQuery<
    ApiResponse<MikrotikPackageRow[]>
  >({
    queryKey: ["mikrotik-packages", params],
    url: "mikrotik-packages",
    params,
    pagination: false,
    enabled: Boolean(params?.network_id),
  });

  const packages = data?.data ?? [];
  const columns = useMikrotikPackageColumns();
  const toolbarTitle = t("mikrotik_package.title_plural");

  return (
    <div className="space-y-3">
      <DataTable
        data={packages}
        setFilter={setFilter}
        columns={columns}
        toolbarOptions={{ filter: MikrotikPackageFilterSchema() }}
        toggleColumns={false}
        pagination={undefined}
        isLoading={isLoading}
        isFetching={isFetching}
        queryKey="mikrotik-packages"
        form={MikrotikPackagesToolbarActions}
        toolbarTitle={toolbarTitle}
      />
    </div>
  );
};

export default MikrotikPackagesTable;
