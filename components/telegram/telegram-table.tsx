"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { SettingsSectionButton } from "@/components/settings/settings-section-button";
import { getTelegramColumns } from "@/components/telegram/telegram-column";
import { TelegramFilterSchema } from "@/components/telegram/telegram-filter-schema";
import TelegramForm from "@/components/telegram/telegram-form";
import { TelegramRow } from "@/components/telegram/telegram-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";

const TelegramTable: FC = () => {
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
    useApiQuery<PaginatedApiResponse<TelegramRow>>({
      queryKey: ["telegram"],
      url: "telegram",
      params,
    });

  const rows = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const columns = useMemo(() => getTelegramColumns(), []);

  return (
    <DataTable
      data={rows}
      columns={columns}
      setFilter={setFilter}
      toolbar={{
        title: pagination?.total
          ? `${t("telegram.title_plural")} (${pagination.total})`
          : t("telegram.title_plural"),
        end: [
          { key: "settings-section-button", node: <SettingsSectionButton section="telegram" size="default" /> },
        ],
        features: {
          columns: true,
          filter: { filter: TelegramFilterSchema() },
          add: hasPermission("telegram.create") ? TelegramForm : undefined,
        },
      }}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
};

export default TelegramTable;
