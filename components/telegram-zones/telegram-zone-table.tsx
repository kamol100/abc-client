"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { usePermissions } from "@/context/app-provider";
import { getTelegramZoneColumns } from "@/components/telegram-zones/telegram-zone-column";
import { TelegramZoneFilterSchema } from "@/components/telegram-zones/telegram-zone-filter-schema";
import TelegramZoneForm from "@/components/telegram-zones/telegram-zone-form";
import { TelegramZoneRow } from "@/components/telegram-zones/telegram-zone-type";

const TelegramZoneTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [filterValue, setFilter] = useState<string | null>(null);
  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue],
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<TelegramZoneRow>>({
      queryKey: ["telegram-zones"],
      url: "telegram-zones",
      params,
    });

  const rows = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const columns = useMemo(() => getTelegramZoneColumns(), []);

  return (
    <DataTable
      data={rows}
      columns={columns}
      setFilter={setFilter}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={hasPermission("telegram-zones.create") ? TelegramZoneForm : undefined}
      toolbarOptions={{ filter: TelegramZoneFilterSchema() }}
      toolbarTitle={
        pagination?.total
          ? `${t("telegram_zone.title_plural")} (${pagination.total})`
          : t("telegram_zone.title_plural")
      }
    />
  );
};

export default TelegramZoneTable;
