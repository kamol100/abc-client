"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import type { DemoRequestRow } from "@/components/demo-requests/demo-request-type";
import { demoRequestsColumns } from "@/components/demo-requests/demo-requests-column";

const DemoRequestTable: FC = () => {
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
        useApiQuery<PaginatedApiResponse<DemoRequestRow>>({
            queryKey: ["demo-requests"],
            url: "demo-requests",
            params,
        });

    const rows = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("admin_demo_request.title_plural")} (${pagination.total})`
        : t("admin_demo_request.title_plural");

    const toolbar: DataTableToolbarConfig = {
        title: toolbarTitle,
        features: {
            columns: true,
        },
    };

    return (
        <DataTable
            data={rows}
            setFilter={setFilter}
            columns={demoRequestsColumns}
            toolbar={toolbar}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="demo-requests"
        />
    );
};

export default DemoRequestTable;
