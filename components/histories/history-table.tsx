"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { getHistoryColumns } from "./history-column";
import HistoryFilterSchema from "./history-filter-schema";
import type { HistoryRow } from "./history-type";

const HistoryTable: FC = () => {
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
        useApiQuery<PaginatedApiResponse<HistoryRow>>({
            queryKey: ["histories"],
            url: "histories",
            params,
        });

    const histories = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const columns = useMemo(() => getHistoryColumns(() => pagination), [pagination]);

    useEffect(() => {
        if (!filterValue?.includes("#")) {
            setCurrentPage(1);
        }
    }, [filterValue, setCurrentPage]);

    const toolbarTitle = pagination?.total
        ? `${t("history.title_plural")} (${pagination.total})`
        : t("history.title_plural");

    const toolbarOptions = useMemo(
        () => ({
            filter: HistoryFilterSchema(),
            watchFields: ["description", "created_at"],
        }),
        []
    );

    return (
        <DataTable
            data={histories}
            columns={columns}
            setFilter={setFilter}
            toggleColumns
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            toolbarTitle={toolbarTitle}
            toolbarOptions={toolbarOptions}
            queryKey="histories"
            form={undefined}
        />
    );
};

export default HistoryTable;
