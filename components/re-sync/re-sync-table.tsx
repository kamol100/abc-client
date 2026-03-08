"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useFetch } from "@/app/actions";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import ReSyncFilterSchema from "@/components/re-sync/re-sync-filter-schema";
import ReSyncForm from "@/components/re-sync/re-sync-form";
import { useReSyncColumns } from "@/components/re-sync/re-sync-column";
import { ReSyncListData, ReSyncRow } from "@/components/re-sync/re-sync-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";

const ReSyncTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [filterValue, setFilter] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const canLoad = hasPermission("client-sync.load");
  const canResolve = hasPermission("client-sync.all-sync");

  const params = useMemo(
    () =>
      filterValue ? Object.fromEntries(new URLSearchParams(filterValue)) : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<
    ApiResponse<ReSyncListData>
  >({
    queryKey: ["re-sync"],
    url: "client-sync",
    params,
  });

  const { mutate: syncIndividual } = useMutation<
    ApiResponse<unknown>,
    unknown,
    number
  >({
    mutationFn: async (syncId: number) => {
      const response = await useFetch({
        url: `/client-individual-sync/${syncId}`,
        method: "PUT",
        data: { test: "test" },
      });
      if (!response?.success) throw response;
      return response as ApiResponse<unknown>;
    },
    onMutate: (syncId) => {
      setSyncingId(syncId);
    },
    onSuccess: () => {
      toast.success(t("re_sync.messages.individual_sync_success"));
      queryClient.invalidateQueries({ queryKey: ["re-sync"] });
    },
    onError: (error) => {
      const message = parseApiError(error);
      toast.error(t(String(message || "common.request_failed")));
    },
    onSettled: () => {
      setSyncingId(null);
    },
  });

  const listData: ReSyncRow[] = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const totalCount = pagination?.total ?? 0;
  const matchCount = data?.data?.match_count ?? 0;
  const notMatchCount = data?.data?.not_match_count ?? 0;
  const summary = data?.data?.summary ?? "";
  const columns = useReSyncColumns({
    pagination,
    syncingId,
    onIndividualSync: syncIndividual,
  });
  const toolbarTitle = totalCount
    ? `${t("re_sync.title_plural")} (${totalCount})`
    : t("re_sync.title_plural");

  return (
    <div className="space-y-3">
      {canLoad && <ReSyncForm actionType="load" />}
      {canResolve && <ReSyncForm actionType="resolve" />}

      <Card className="p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {summary || t("re_sync.summary.empty")}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span>
              {t("re_sync.summary.total_clients")}: {totalCount}
            </span>
            <span className="text-green-600">
              {t("re_sync.summary.match")}: {matchCount}
            </span>
            <span className="text-red-600">
              {t("re_sync.summary.not_match")}: {notMatchCount}
            </span>
          </div>
        </div>
      </Card>

      <DataTable
        data={listData}
        setFilter={setFilter}
        columns={columns}
        toolbarOptions={{ filter: ReSyncFilterSchema() }}
        toggleColumns
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        isFetching={isFetching}
        queryKey="re-sync"
        toolbarTitle={toolbarTitle}
      />
    </div>
  );
};

export default ReSyncTable;
