"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { isImportable, useImportClientColumns } from "@/components/import-client/import-client-column";
import ImportClientBulkDialog from "@/components/import-client/import-client-bulk-dialog";
import ImportClientFilterSchema from "@/components/import-client/import-client-filter-schema";
import ImportClientSyncForm from "@/components/import-client/import-client-sync-form";
import { SyncClientRow } from "@/components/import-client/import-client-type";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";

const ImportClientTable: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const canSync = hasPermission("sync-clients.sync");
    const canImport = hasPermission("sync-clients.show");

    const [filterValue, setFilter] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<SyncClientRow>>({
            queryKey: ["sync-clients"],
            url: "sync-clients",
            params,
        });

    const syncClients = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const handleSelectRow = useCallback((id: number, selected: boolean) => {
        setSelectedIds((current) =>
            selected
                ? current.includes(id)
                    ? current
                    : [...current, id]
                : current.filter((selectedId) => selectedId !== id)
        );
    }, []);

    const handleSelectAllCurrentPage = useCallback((ids: number[], selected: boolean) => {
        setSelectedIds((current) => {
            if (selected) {
                const nextIds = ids.filter((id) => !current.includes(id));
                return [...current, ...nextIds];
            }
            return current.filter((id) => !ids.includes(id));
        });
    }, []);

    const columns = useImportClientColumns(
        selectedIds,
        handleSelectRow,
        handleSelectAllCurrentPage,
        syncClients
    );
    const importableIds = syncClients.filter(isImportable).map((row) => row.id);
    const selectAllActive =
        importableIds.length > 0 && importableIds.every((id) => selectedIds.includes(id));
    const toolbarTitle = pagination?.total
        ? `${t("import_client.title_plural")} (${pagination.total})`
        : t("import_client.title_plural");

    return (
        <div className="space-y-3">
            {canSync && <ImportClientSyncForm />}
            <DataTable
                data={syncClients}
                setFilter={setFilter}
                columns={columns}
                toolbarOptions={{ filter: ImportClientFilterSchema() }}
                toggleColumns
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading || isFetching}
                isFetching={isFetching}
                queryKey="sync-clients"
                toolbarTitle={toolbarTitle}
                toolbarInfoComponent={
                    selectAllActive ? (
                        <MyBadge type="warning" variant="soft" size="sm" className="shrink-0">
                            {t("import_client.messages.select_all_pages", {
                                count: pagination?.total ?? 0,
                            })}
                        </MyBadge>
                    ) : null
                }
                toolbarBeforeViewOptions={
                    canImport && selectedIds.length > 0 ? (
                        <ImportClientBulkDialog
                            allImport={selectAllActive}
                            importIds={selectAllActive ? [] : selectedIds}
                            onImported={() => setSelectedIds([])}
                            trigger={
                                <MyButton
                                    type="button"
                                    size="default"
                                    variant="outline"
                                    icon={false}
                                >
                                    <Upload aria-hidden />
                                    {t("import_client.actions.import")}
                                </MyButton>
                            }
                        />
                    ) : null
                }
            />
        </div>
    );
};

export default ImportClientTable;
