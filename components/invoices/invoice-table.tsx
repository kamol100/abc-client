"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import MyButton from "@/components/my-button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePermissions } from "@/context/app-provider";
import { useInvoiceColumns } from "./invoice-column";
import InvoiceFilterSchema from "./invoice-filter-schema";
import InvoiceReports from "./invoice-reports";
import { InvoiceListApiResponse } from "./invoice-type";

type InvoiceTableProps = {
    toolbarTitleKey?: string;
    showCreateAction?: boolean;
    filterValue?: string;
    tableToolBar?: boolean;
    reportsToolbar?: boolean;
};

const InvoiceTable: FC<InvoiceTableProps> = ({
    toolbarTitleKey = "invoice.title_plural",
    showCreateAction = true,
    filterValue = null,
    tableToolBar = true,
    reportsToolbar = true,
}) => {
    const { t } = useTranslation();
    const { isMobile } = useSidebar();
    const { hasPermission } = usePermissions();
    const columns = useInvoiceColumns();
    const [filter, setFilter] = useState<string | null>(filterValue);

    const params = useMemo(
        () => {
            if (!filter) return undefined;
            const queryParams = Object.fromEntries(
                new URLSearchParams(filter),
            ) as Record<string, string>;

            // Keep backward compatibility for APIs expecting trackID.
            if (queryParams.track_id && !queryParams.trackID) {
                queryParams.trackID = queryParams.track_id;
            }

            return queryParams;
        },
        [filter],
    );

    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<InvoiceListApiResponse>({
        queryKey: ["invoices"],
        url: "invoices",
        params,
    });

    const invoices = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const reports = data?.data?.reports;

    const toolbarOptions = useMemo(() => ({ filter: InvoiceFilterSchema() }), []);

    const toolbarTitle = pagination?.total
        ? `${t(toolbarTitleKey)} (${pagination.total})`
        : t(toolbarTitleKey);

    const CreateButton = () => (
        <MyButton
            action="add"
            size="default"
            variant="default"
            title={isMobile ? undefined : t("common.add")}
            url="/invoices/create"
        />
    );

    return (
        <div className="space-y-4">
            {reportsToolbar && <InvoiceReports reports={reports} isLoading={isLoading} />}

            <DataTable
                data={invoices}
                setFilter={setFilter}
                columns={columns}
                toolbarOptions={toolbarOptions}
                toggleColumns={true}
                toolbar={tableToolBar}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading || isFetching}
                isFetching={isFetching}
                queryKey="invoices"
                toolbarTitle={toolbarTitle}
                form={
                    hasPermission("invoices.create") && showCreateAction
                        ? CreateButton
                        : undefined
                }
            />
        </div>
    );
};

export default InvoiceTable;
