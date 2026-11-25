"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { FC, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useFetch } from "@/app/actions";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { useMikrotikSyncColumns } from "@/components/mikrotik-sync/mikrotik-sync-column";
import MikrotikSyncBulkDialog from "@/components/mikrotik-sync/mikrotik-sync-bulk-dialog";
import MikrotikSyncFilterSchema, {
  MIKROTIK_SYNC_DEFAULT_FILTER,
} from "@/components/mikrotik-sync/mikrotik-sync-filter-schema";
import MikrotikSyncActionButton from "@/components/mikrotik-sync/mikrotik-sync-form";
import {
  MikrotikSyncList,
  MikrotikSyncRow,
} from "@/components/mikrotik-sync/mikrotik-sync-type";
import MyButton from "@/components/my-button";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { objectToQueryString, parseApiError } from "@/lib/helper/helper";

const MikrotikSyncTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [filterValue, setFilter] = useState<string | null>(() =>
    objectToQueryString(MIKROTIK_SYNC_DEFAULT_FILTER)
  );
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleFilterChange = useCallback((query: string) => {
    setSelectedIds([]);
    setFilter(query);
  }, []);
  const canLoad = hasPermission("mikrotik-sync.load");
  const canResolve = hasPermission("mikrotik-sync.all-sync");
  const canBulkImport = hasPermission("mikrotik-sync.bulk-import");

  const params = useMemo(
    () => (filterValue ? Object.fromEntries(new URLSearchParams(filterValue)) : undefined),
    [filterValue]
  );
  const { data, isLoading, isFetching, setCurrentPage, refetch } = useApiQuery<
    ApiResponse<MikrotikSyncList>
  >({
    queryKey: ["mikrotik-sync"],
    url: "mikrotik-sync",
    params,
  });
  const { mutate: syncIndividual } = useMutation<ApiResponse<unknown>, unknown, string>({
    mutationFn: async (syncId: string) => {
      const response = await useFetch({
        url: `/mikrotik-sync/${syncId}/resolve`,
        method: "PUT",
      });
      if (!response?.success) throw response;
      return response as ApiResponse<unknown>;
    },
    onMutate: (syncId) => {
      setSyncingId(syncId);
    },
    onSuccess: () => {
      toast.success(t("mikrotik_sync.messages.individual_sync_success"));
      queryClient.invalidateQueries({ queryKey: ["mikrotik-sync"] });
    },
    onError: (error) => {
      const message = parseApiError(error);
      toast.error(t(String(message || "common.request_failed")));
    },
    onSettled: () => {
      setSyncingId(null);
    },
  });

  const rows: MikrotikSyncRow[] = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const totalCount = pagination?.total ?? 0;
  const handleSelectRow = useCallback((id: string, selected: boolean) => {
    setSelectedIds((current) =>
      selected ? (current.includes(id) ? current : [...current, id]) : current.filter((selectedId) => selectedId !== id)
    );
  }, []);
  const handleSelectAllCurrentPage = useCallback((ids: string[], selected: boolean) => {
    setSelectedIds((current) => {
      if (selected) {
        return [...current, ...ids.filter((id) => !current.includes(id))];
      }
      return current.filter((id) => !ids.includes(id));
    });
  }, []);
  const columns = useMikrotikSyncColumns({
    pagination,
    syncingId,
    selectedIds,
    currentPageRows: rows,
    onIndividualSync: syncIndividual,
    onSelectRow: handleSelectRow,
    onSelectAllCurrentPage: handleSelectAllCurrentPage,
  });
  const selectedCount = selectedIds.length;
  const toolbarOptions = useMemo(
    () => ({
      filter: MikrotikSyncFilterSchema(),
      filter_row: 2,
      defaultValues: MIKROTIK_SYNC_DEFAULT_FILTER,
    }),
    [],
  );
  const toolbarTitle = totalCount
    ? `${t("mikrotik_sync.title_plural")} (${totalCount})`
    : t("mikrotik_sync.title_plural");

  const toolbar: DataTableToolbarConfig = {
    title: toolbarTitle,
    start: [
      { key: "load", show: canLoad, mobile: "actions", node: <MikrotikSyncActionButton action="load" /> },
      { key: "resolve", show: canResolve, mobile: "actions", node: <MikrotikSyncActionButton action="resolve" /> },
    ],
    end: [
      { key: "actions", node: canBulkImport && selectedIds.length > 0 ? (
          <MikrotikSyncBulkDialog
            importIds={selectedIds}
            unimportedCount={data?.data?.unimported_count ?? 0}
            onImported={() => {
              setSelectedIds([]);
              void refetch();
            }}
            trigger={
              <MyButton
                type="button"
                size="default"
                variant="outline"
                icon={false}
                className="shrink-0 max-md:w-9 max-md:px-0"
                aria-label={t("mikrotik_sync.actions.import_selected", { count: selectedCount })}
              >
                <Upload aria-hidden />
                <span className="hidden md:inline">
                  {t("mikrotik_sync.actions.import_selected", { count: selectedCount })}
                </span>
              </MyButton>
            }
          />
        ) : null },
    ],
    features: {
      columns: true,
      filter: toolbarOptions,
    },
  };

  return (
    <div className="space-y-3 w-full">
      <Card className="p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {data?.data?.summary || t("mikrotik_sync.summary.empty")}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span>
              {t("mikrotik_sync.summary.total_clients")}: {totalCount}
            </span>
            <span className="text-primary">
              {t("mikrotik_sync.summary.match")}: {data?.data?.match_count ?? 0}
            </span>
            <span className="text-destructive">
              {t("mikrotik_sync.summary.not_match")}: {data?.data?.not_match_count ?? 0}
            </span>
          </div>
        </div>
      </Card>

      <DataTable
        data={rows}
        setFilter={handleFilterChange}
        columns={columns}
        toolbar={toolbar}
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading || isFetching}
        isFetching={isFetching}
        queryKey="mikrotik-sync"
      />
    </div>
  );
};

export default MikrotikSyncTable;
