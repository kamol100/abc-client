"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import MyButton from "@/components/my-button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePermissions } from "@/context/app-provider";
import { useResellerColumns } from "@/components/resellers/reseller-column";
import ResellerFilterSchema from "@/components/resellers/reseller-filter-schema";
import { ResellerRow } from "@/components/resellers/reseller-type";
import ResellerImportDialog from "@/components/resellers/reseller-import-dialog";

const ResellerTable: FC = () => {
    const { t } = useTranslation();
    const { isMobile } = useSidebar();
    const { hasPermission } = usePermissions();
    const columns = useResellerColumns();
    const [filterValue, setFilter] = useState<string | null>(null);

    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ResellerRow>>({
            queryKey: ["resellers"],
            url: "resellers",
            params,
        });

    const resellers = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const toolbarOptions = {
        filter: ResellerFilterSchema(),
    };

    const FormLink = () => (
        <MyButton
            action="add"
            size="default"
            variant="default"
            title={isMobile ? undefined : t("common.add")}
            url="/resellers/create"
        />
    );

    const importControl = hasPermission("resellers.import")
        ? <ResellerImportDialog />
        : undefined;

    const toolbarTitle = pagination?.total
        ? `${t("reseller.title_plural")} (${pagination.total})`
        : t("reseller.title_plural");

    return (
        <DataTable
            data={resellers}
            setFilter={setFilter}
            columns={columns}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading || isFetching}
            isFetching={isFetching}
            queryKey="resellers"
            form={hasPermission("resellers.create") ? FormLink : undefined}
            toolbarTitle={toolbarTitle}
            toolbarBeforeForm={importControl}
        />
    );
};

export default ResellerTable;
