"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { usePermissions } from "@/context/app-provider";
import { useTjBoxColumns } from "@/components/tj-box/tj-box-column";
import TjBoxFilterSchema from "@/components/tj-box/tj-box-filter-schema";
import TjBoxForm from "@/components/tj-box/tj-box-form";
import { TjBoxRow } from "@/components/tj-box/tj-box-type";

const TjBoxTable: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const columns = useTjBoxColumns();
    const [filterValue, setFilter] = useState<string | null>(null);

    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<TjBoxRow>>({
            queryKey: ["tj-boxes"],
            url: "tj-boxes",
            params,
        });

    const tjBoxes = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarOptions = {
        filter: TjBoxFilterSchema(),
    };

    const toolbarTitle = pagination?.total
        ? `${t("tj_box.title_plural")} (${pagination.total})`
        : t("tj_box.title_plural");

    return (
        <DataTable
            data={tjBoxes}
            setFilter={setFilter}
            columns={columns}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="tj-boxes"
            form={hasPermission("tj-boxes.create") ? TjBoxForm : undefined}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default TjBoxTable;
