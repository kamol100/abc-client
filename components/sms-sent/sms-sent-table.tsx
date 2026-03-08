"use client";

import { FC, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { getSmsSentColumns } from "@/components/sms-sent/sms-sent-column";
import { SmsSentClientRow } from "@/components/sms-sent/sms-sent-type";

type SmsSentTableProps = {
  enabled: boolean;
  params?: Record<string, string | number>;
  onTotalCountChange?: (count: number) => void;
};

const SmsSentTable: FC<SmsSentTableProps> = ({
  enabled,
  params,
  onTotalCountChange = () => {},
}) => {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, isError, error, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<SmsSentClientRow>>({
      queryKey: ["sms-sent-clients"],
      url: "sms-clients",
      params,
      enabled,
    });

  const clients = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  useEffect(() => {
    onTotalCountChange(enabled ? pagination?.total ?? 0 : 0);
  }, [enabled, pagination?.total, onTotalCountChange]);

  const columns = useMemo(
    () => getSmsSentColumns(() => pagination),
    [pagination]
  );

  if (!enabled) {
    return null;
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {parseApiError(error) || t("common.request_failed")}
      </div>
    );
  }

  return (
    <DataTable
      data={clients}
      columns={columns}
      toolbar={false}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      queryKey="sms-sent-clients"
    />
  );
};

export default SmsSentTable;
