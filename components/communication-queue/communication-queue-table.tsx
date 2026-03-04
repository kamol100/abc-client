"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { getCommunicationQueueColumns } from "./communication-queue-column";
import { communicationQueueFilterSchema } from "./communication-queue-filter-schema";
import { CommunicationQueueResendAllDialog } from "./communication-queue-resend-all-dialog";
import { usePermissions } from "@/context/app-provider";
import type { CommunicationQueueRow } from "./communication-queue-type";

const CommunicationQueueTable: FC = () => {
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
    useApiQuery<PaginatedApiResponse<CommunicationQueueRow>>({
      queryKey: ["communicationQueue"],
      url: "communication-queue",
      params,
    });

  const items = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const columns = useMemo(
    () => getCommunicationQueueColumns(() => pagination),
    [pagination]
  );

  useEffect(() => {
    if (!filterValue?.includes("#")) {
      setCurrentPage(1);
    }
  }, [filterValue, setCurrentPage]);

  const toolbarTitle = pagination?.total
    ? t("communication_queue.title_plural_count", { count: pagination.total })
    : t("communication_queue.title_plural");

  const toolbarOptions = useMemo(
    () => ({
      filter: communicationQueueFilterSchema(),
      watchFields: ["sms_to", "sms_from", "sms_type", "status"],
    }),
    []
  );

  const canResendAll = hasPermission("communication-queue.resend-all");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">
          {t("communication_queue.title_plural")}
        </h2>
        {canResendAll && <CommunicationQueueResendAllDialog />}
      </div>
      <DataTable
        data={items}
        columns={columns}
        setFilter={setFilter}
        toggleColumns
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        isFetching={isFetching}
        toolbarTitle={toolbarTitle}
        toolbarOptions={toolbarOptions}
        queryKey="communicationQueue"
        form={undefined}
      />
    </div>
  );
};

export default CommunicationQueueTable;
