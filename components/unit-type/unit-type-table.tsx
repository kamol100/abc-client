"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { UnitTypeColumns } from "./unit-type-column";
import UnitTypeForm from "./unit-type-form";
import { UnitTypeRow } from "./unit-type-type";
import { useTranslation } from "react-i18next";

const UnitTypeTable: FC = () => {
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
        useApiQuery<PaginatedApiResponse<UnitTypeRow>>({
            queryKey: ["unit-types"],
            url: "unit-types",
            params,
        });

    const unitTypes = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("unit_type.title_plural")} (${pagination.total})`
        : t("unit_type.title_plural");

    return (
        <DataTable
            data={unitTypes}
            setFilter={setFilter}
            columns={UnitTypeColumns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={UnitTypeForm}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default UnitTypeTable;
