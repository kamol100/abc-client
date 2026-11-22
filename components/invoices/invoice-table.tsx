"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { PrefixSettingsButton } from "@/components/settings/ui/settings-button";
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
            const queryParams: Record<string, string> = filter
                ? (Object.fromEntries(new URLSearchParams(filter)) as Record<string, string>)
                : {};

            // Keep backward compatibility for APIs expecting trackID.
            if (queryParams.track_id && !queryParams.trackID) {
                queryParams.trackID = queryParams.track_id;
            }

            if (!reportsToolbar) {
                queryParams.include_reports = "0";
            }

            return Object.keys(queryParams).length > 0 ? queryParams : undefined;
        },
        [filter, reportsToolbar],
    );

    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<InvoiceListApiResponse>({
        queryKey: ["invoices"],
        url: "invoices",
        params,
    });

    const invoices = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const reports = data?.data?.reports;

    const toolbarOptions = useMemo(
        () => ({
            filter: InvoiceFilterSchema(),
            filter_row: 2,
        }),
        [],
    );

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
            {/* Without the toolbar (client view), the totals sit above the table. */}
            {reportsToolbar && !tableToolBar && <InvoiceReports reports={reports} isLoading={isLoading} />}

            <DataTable
                data={invoices}
                setFilter={setFilter}
                columns={columns}
                toolbar={tableToolBar ? {
                    title: toolbarTitle,
                    center: reportsToolbar
                        ? [{ key: "totals", node: <InvoiceReports reports={reports} isLoading={isLoading} layout="toolbar" /> }]
                        : undefined,
                    end: [
                        { key: "prefix-settings-button", inFilterRow: false, node: <PrefixSettingsButton field="invoice_prefix" /> },
                    ],
                    features: {
                        columns: true,
                        filter: toolbarOptions,
                        add: hasPermission("invoices.create") && showCreateAction
                            ? CreateButton
                            : undefined,
                    },
                } : false}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="invoices"
            />
        </div>
    );
};

export default InvoiceTable;
