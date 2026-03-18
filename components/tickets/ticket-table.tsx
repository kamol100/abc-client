"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { TicketColumns } from "./ticket-column";
import { TicketRow } from "./ticket-type";
import { useTranslation } from "react-i18next";
import TicketCreateDialog from "./ticket-create-dialog";
import TicketFilterSchema from "./ticket-filter-schema";

interface TicketTableProps {
    clientId?: string;
    filterValue?: string;
}

const TicketTable: FC<TicketTableProps> = ({ clientId, filterValue }) => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<string | null>(filterValue ?? null);

    const params = useMemo(() => {
        const base: Record<string, unknown> = {};
        if (clientId) base.client_id = clientId;
        if (filter) {
            const parsed = Object.fromEntries(new URLSearchParams(filterValue));
            Object.assign(base, parsed);
        }
        return Object.keys(base).length > 0 ? base : undefined;
    }, [clientId, filter]);

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<TicketRow>>({
            queryKey: ["tickets"],
            url: "tickets",
            params,
        });
    const tickets = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("ticket.title_plural")} (${pagination.total})`
        : t("ticket.title_plural");

    const toolbarOptions = {
        filter: TicketFilterSchema(),
    };

    return (
        <DataTable
            data={tickets}
            setFilter={setFilter}
            columns={TicketColumns}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading || isFetching}
            isFetching={isFetching}
            form={TicketCreateDialog}
            toolbarTitle={toolbarTitle}
            queryKey="tickets"
        />
    );
};

export default TicketTable;
