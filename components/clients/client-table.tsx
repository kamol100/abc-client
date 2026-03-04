"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { useSidebar } from "@/components/ui/sidebar";
import ActionButton from "@/components/action-button";
import { useClientColumns } from "@/components/clients/client-column";
import ClientFilterSchema from "@/components/clients/client-filter-schema";
import { ClientRow } from "@/components/clients/client-type";

const ClientTable: FC = () => {
    const { t } = useTranslation();
    const { isMobile } = useSidebar();
    const columns = useClientColumns();

    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ClientRow>>({
            queryKey: ["clients"],
            url: "clients",
            params,
        });

    const clients = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarOptions = {
        filter: ClientFilterSchema(),
    };

    const FormLink = () => (
        <ActionButton
            action="add"
            title={isMobile ? undefined : t("common.add")}
            url="/clients/create"
        />
    );

    const toolbarTitle = pagination?.total
        ? `${t("client.title_plural")} (${pagination.total})`
        : t("client.title_plural");

    return (
        <DataTable
            data={clients}
            setFilter={setFilter}
            columns={columns}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey={"clients"}
            form={FormLink}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default ClientTable;
