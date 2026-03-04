"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { getCommunicationLogColumns } from "./communication-log-column";
import CommunicationLogFilterSchema from "./communication-log-filter-schema";
import type { CommunicationLogRow } from "./communication-log-type";

const CommunicationLogTable: FC = () => {
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
    useApiQuery<PaginatedApiResponse<CommunicationLogRow>>({
      queryKey: ["communicationLogs"],
      url: "communication-logs",
      params,
    });

  const logs = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const columns = useMemo(
    () => getCommunicationLogColumns(() => pagination),
    [pagination]
  );

  useEffect(() => {
    if (!filterValue?.includes("#")) {
      setCurrentPage(1);
    }
  }, [filterValue, setCurrentPage]);

  const toolbarTitle = pagination?.total
    ? t("communication_log.title_plural_count", { count: pagination.total })
    : t("communication_log.title_plural");

  const toolbarOptions = useMemo(
    () => ({
      filter: CommunicationLogFilterSchema(),
      watchFields: [
        "channel",
        "sms_to",
        "sms_from",
        "sms_type",
        "status",
      ],
    }),
    []
  );

  return (
    <DataTable
      data={logs}
      columns={columns}
      setFilter={setFilter}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      toolbarTitle={toolbarTitle}
      toolbarOptions={toolbarOptions}
      queryKey="communicationLogs"
      form={undefined}
    />
  );
};

export default CommunicationLogTable;
