"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { RoleColumns } from "./role-column";
import RoleForm from "./role-form";
import { RoleRow } from "./role-type";
import { useTranslation } from "react-i18next";

const RoleTable: FC = () => {
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
        useApiQuery<PaginatedApiResponse<RoleRow>>({
            queryKey: ["roles"],
            url: "roles",
            params,
        });

    const roles = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("role.title_plural")} (${pagination.total})`
        : t("role.title_plural");

    return (
        <DataTable
            data={roles}
            setFilter={setFilter}
            columns={RoleColumns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={RoleForm}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default RoleTable;
