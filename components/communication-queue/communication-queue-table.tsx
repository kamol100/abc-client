"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { getCommunicationQueueColumns } from "./communication-queue-column";
import { communicationQueueFilterSchema } from "./communication-queue-filter-schema";
import { CommunicationQueueBulkDialog } from "./communication-queue-bulk-dialog";
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
  const canStopAll = hasPermission("communication-queue.stop-all");
  const canDeleteAll = hasPermission("communication-queue.delete-all");
  const bulkActions =
    canResendAll || canStopAll || canDeleteAll ? (
      <>
        {canResendAll && <CommunicationQueueBulkDialog action="resend" />}
        {canStopAll && <CommunicationQueueBulkDialog action="stop" />}
        {canDeleteAll && <CommunicationQueueBulkDialog action="delete" />}
      </>
    ) : null;

  const toolbar: DataTableToolbarConfig = {
    title: toolbarTitle,
    // The bulk buttons sit after the filter button: in `add` while the filter is
    // closed, and in the open filter row (which replaces the actions row).
    end: [{ key: "bulk-actions", onlyInFilterRow: true, node: bulkActions }],
    features: {
      columns: true,
      filter: toolbarOptions,
      add: bulkActions,
    },
  };

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        data={items}
        columns={columns}
        setFilter={setFilter}
        toolbar={toolbar}
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        isFetching={isFetching}
        queryKey="communicationQueue"
      />
    </div>
  );
};

export default CommunicationQueueTable;
