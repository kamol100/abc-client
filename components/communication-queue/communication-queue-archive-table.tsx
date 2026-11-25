"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { usePermissions } from "@/context/app-provider";
import { getCommunicationQueueColumns } from "./communication-queue-column";
import { communicationQueueFilterSchema } from "./communication-queue-filter-schema";
import { CommunicationQueueBulkDialog } from "./communication-queue-bulk-dialog";
import type { CommunicationQueueRow } from "./communication-queue-type";

/** Deleted queue SMS: searchable and filterable, with Restore and Delete permanently. */
const CommunicationQueueArchiveTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(
    () => (filterValue ? Object.fromEntries(new URLSearchParams(filterValue)) : undefined),
    [filterValue],
  );

  const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<CommunicationQueueRow>>({
    queryKey: ["communicationQueueArchive"],
    url: "communication-queue/archive",
    params,
  });

  const items = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const columns = useMemo(() => getCommunicationQueueColumns(() => pagination, "archive"), [pagination]);
  const filterOptions = useMemo(() => ({ filter: communicationQueueFilterSchema({ archive: true }) }), []);

  const canRestoreAll = hasPermission("communication-queue.restore-all");
  const canPurgeAll = hasPermission("communication-queue.force-delete-all");
  const bulkActions =
    canRestoreAll || canPurgeAll ? (
      <>
        {canRestoreAll && <CommunicationQueueBulkDialog action="restore" />}
        {canPurgeAll && <CommunicationQueueBulkDialog action="purge" />}
      </>
    ) : null;

  const toolbar: DataTableToolbarConfig = {
    title: pagination?.total
      ? t("communication_queue.archive.title_count", { count: pagination.total })
      : t("communication_queue.archive.title"),
    // `add` sits after the filter button, open or closed.
    features: {
      columns: true,
      filter: filterOptions,
      add: bulkActions,
    },
  };

  return (
    <DataTable
      data={items}
      columns={columns}
      setFilter={setFilter}
      toolbar={toolbar}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      queryKey="communicationQueueArchive"
    />
  );
};

export default CommunicationQueueArchiveTable;
