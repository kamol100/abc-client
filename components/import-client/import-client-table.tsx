"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { useImportClientColumns } from "@/components/import-client/import-client-column";
import ImportClientFilterSchema from "@/components/import-client/import-client-filter-schema";
import ImportClientSyncForm from "@/components/import-client/import-client-sync-form";
import { SyncClientRow } from "@/components/import-client/import-client-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";

const ImportClientTable: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const canSync = hasPermission("sync-clients.sync");

    const [filterValue, setFilter] = useState<string | null>(null);
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
    const columns = useImportClientColumns(pagination);
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
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="sync-clients"
                toolbarTitle={toolbarTitle}
            />
        </div>
    );
};

export default ImportClientTable;
