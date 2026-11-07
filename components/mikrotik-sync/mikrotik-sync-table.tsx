"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { FC, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useFetch } from "@/app/actions";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import {
  isImportable,
  useMikrotikSyncColumns,
} from "@/components/mikrotik-sync/mikrotik-sync-column";
import MikrotikSyncBulkDialog from "@/components/mikrotik-sync/mikrotik-sync-bulk-dialog";
import MikrotikSyncFilterSchema from "@/components/mikrotik-sync/mikrotik-sync-filter-schema";
import MikrotikSyncForm from "@/components/mikrotik-sync/mikrotik-sync-form";
import {
  MikrotikSyncList,
  MikrotikSyncRow,
} from "@/components/mikrotik-sync/mikrotik-sync-type";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";

const MikrotikSyncTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [filterValue, setFilter] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
  const importableIds = rows.filter(isImportable).map((row) => row.id);
  const selectAllActive =
    importableIds.length > 0 && importableIds.every((id) => selectedIds.includes(id));
  const toolbarOptions = useMemo(
    () => ({
      filter: MikrotikSyncFilterSchema()
    }),
    [],
  );
  const toolbarTitle = totalCount
    ? `${t("mikrotik_sync.title_plural")} (${totalCount})`
    : t("mikrotik_sync.title_plural");

  return (
    <div className="space-y-3 w-full">
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
        {canLoad && (
          <div className="w-full min-w-0 md:flex-1">
            <MikrotikSyncForm action="load" />
          </div>
        )}
        {canResolve && (
          <div className="w-full min-w-0 md:flex-1">
            <MikrotikSyncForm action="resolve" />
          </div>
        )}
      </div>

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
        setFilter={setFilter}
        columns={columns}
        toolbarOptions={toolbarOptions}
        toggleColumns
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading || isFetching}
        isFetching={isFetching}
        queryKey="mikrotik-sync"
        toolbarTitle={toolbarTitle}
        toolbarInfoComponent={
          selectAllActive ? (
            <MyBadge type="error" variant="soft" size="md" className="shrink-0">
              {t("mikrotik_sync.messages.select_all_pages", {
                count: pagination?.total ?? 0,
              })}
            </MyBadge>
          ) : null
        }
        toolbarBeforeViewOptions={
          canBulkImport && selectedIds.length > 0 ? (
            <MikrotikSyncBulkDialog
              allImport={selectAllActive}
              importIds={selectAllActive ? [] : selectedIds}
              onImported={() => {
                setSelectedIds([]);
                void refetch();
              }}
              trigger={
                <MyButton type="button" size="default" variant="outline" icon={false}>
                  <Upload aria-hidden />
                  {t("mikrotik_sync.actions.import")}
                </MyButton>
              }
            />
          ) : null
        }
      />
    </div>
  );
};

export default MikrotikSyncTable;
