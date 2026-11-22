"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { PrefixSettingsButton } from "@/components/settings/ui/settings-button";
import { TicketColumns } from "./ticket-column";
import { TicketRow } from "./ticket-type";
import { useTranslation } from "react-i18next";
import TicketCreateDialog from "./ticket-form";
import TicketFilterSchema from "./ticket-filter-schema";

interface TicketTableProps {
    clientId?: string;
    filterValue?: string;
    tableToolBar?: boolean;
}

const TicketTable: FC<TicketTableProps> = ({ clientId, filterValue, tableToolBar = true }) => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<string | null>(filterValue ?? null);

    const params = useMemo(() => {
        const queryParams: Record<string, string> = filter
            ? (Object.fromEntries(new URLSearchParams(filter)) as Record<string, string>)
            : {};

        if (clientId && !queryParams.client_id && !queryParams.client_uuid) {
            queryParams.client_id = clientId;
        }

        return Object.keys(queryParams).length > 0 ? queryParams : undefined;
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

    const toolbarOptions = useMemo(() => ({ filter: TicketFilterSchema() }), []);

    return (
        <DataTable
            data={tickets}
            setFilter={setFilter}
            columns={TicketColumns}
            toolbar={tableToolBar ? {
                title: toolbarTitle,
                end: [
                    { key: "prefix-settings-button", inFilterRow: false, node: <PrefixSettingsButton field="ticket_code_prefix" /> },
                ],
                features: {
                    columns: true,
                    filter: toolbarOptions,
                    add: TicketCreateDialog,
                },
            } : false}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="tickets"
        />
    );
};

export default TicketTable;
