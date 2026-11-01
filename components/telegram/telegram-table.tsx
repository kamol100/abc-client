"use client";

import { Settings } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import SettingsForm from "@/components/settings/settings-form";
import { getTelegramColumns } from "@/components/telegram/telegram-column";
import { TelegramFilterSchema } from "@/components/telegram/telegram-filter-schema";
import TelegramForm from "@/components/telegram/telegram-form";
import { TelegramRow } from "@/components/telegram/telegram-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";

function TelegramBotSettingsButton() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(false);

  if (!hasPermission("company-settings.access")) return null;

  return (
    <>
      <MyButton
        type="button"
        size="default"
        variant="outline"
        tooltip="settings.sections.telegram.title"
        aria-label={t("settings.sections.telegram.title")}
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4" />
      </MyButton>
      <MyDialog
        open={open}
        onOpenChange={setOpen}
        size="2xl"
        title="settings.sections.telegram.title"
        description="settings.sections.telegram.description"
      >
        <SettingsForm section="telegram" embedded />
      </MyDialog>
    </>
  );
}

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
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={hasPermission("telegram.create") ? TelegramForm : undefined}
      toolbarOptions={{ filter: TelegramFilterSchema() }}
      toolbarBeforeViewOptions={<TelegramBotSettingsButton />}
      toolbarTitle={
        pagination?.total
          ? `${t("telegram.title_plural")} (${pagination.total})`
          : t("telegram.title_plural")
      }
    />
  );
};

export default TelegramTable;
