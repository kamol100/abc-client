"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useOltColumns } from "./olt-column";
import { OltRow } from "./olt-type";

const OLT_FILTER: FieldConfig[] = [
    { type: "text", name: "search", placeholder: "olt.filters.search", permission: true, watchForFilter: true },
];

const OltTable: FC = () => {
    const { t } = useTranslation();
    const columns = useOltColumns();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () => (filterValue ? Object.fromEntries(new URLSearchParams(filterValue)) : undefined),
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<OltRow>>({
        queryKey: ["olts"],
        url: "olts",
        params,
    });

    const olts = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const toolbarTitle = pagination?.total
        ? `${t("olt.title_plural")} (${pagination.total})`
        : t("olt.title_plural");

    return (
        <DataTable
            data={olts}
            setFilter={setFilter}
            columns={columns}
            toolbarOptions={{ filter: OLT_FILTER }}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            toolbarTitle={toolbarTitle}
            queryKey="olts"
        />
    );
};

export default OltTable;
