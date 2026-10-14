"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { useArchivedClientColumns } from "@/components/archived-clients/archived-client-column";
import { ArchivedClientRow } from "@/components/archived-clients/archived-client-type";
import ClientFilterSchema from "@/components/clients/client-filter-schema";

const ArchivedClientTable: FC = () => {
    const { t } = useTranslation();
    const columns = useArchivedClientColumns();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ArchivedClientRow>>({
            queryKey: ["archived-clients"],
            url: "archived-clients",
            params,
        });

    const clients = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const toolbarTitle = pagination?.total
        ? `${t("archived_client.title_plural")} (${pagination.total})`
        : t("archived_client.title_plural");

    return (
        <DataTable
            data={clients}
            setFilter={setFilter}
            columns={columns}
            toolbarOptions={{ filter: ClientFilterSchema() }}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading || isFetching}
            isFetching={isFetching}
            queryKey="archived-clients"
            toolbarTitle={toolbarTitle}
        />
    );
};

export default ArchivedClientTable;
