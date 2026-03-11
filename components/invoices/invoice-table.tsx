"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import ActionButton from "@/components/action-button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePermissions } from "@/context/app-provider";
import { useInvoiceColumns } from "./invoice-column";
import InvoiceFilterSchema from "./invoice-filter-schema";
import InvoiceReports from "./invoice-reports";
import { InvoiceListApiResponse } from "./invoice-type";

type InvoiceTableProps = {
    toolbarTitleKey?: string;
    showCreateAction?: boolean;
};

const InvoiceTable: FC<InvoiceTableProps> = ({
    toolbarTitleKey = "invoice.title_plural",
    showCreateAction = true,
}) => {
    const { t } = useTranslation();
    const { isMobile } = useSidebar();
    const { hasPermission } = usePermissions();
    const columns = useInvoiceColumns();
    const [filterValue, setFilter] = useState<string | null>(null);

    const params = useMemo(
        () => {
            if (!filterValue) return undefined;
            const queryParams = Object.fromEntries(
                new URLSearchParams(filterValue),
            ) as Record<string, string>;

            // Keep backward compatibility for APIs expecting trackID.
            if (queryParams.track_id && !queryParams.trackID) {
                queryParams.trackID = queryParams.track_id;
            }

            return queryParams;
        },
        [filterValue],
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<InvoiceListApiResponse>({
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
        }),
        [],
    );

    const toolbarTitle = pagination?.total
        ? `${t(toolbarTitleKey)} (${pagination.total})`
        : t(toolbarTitleKey);

    const CreateButton = () => (
        <ActionButton
            action="add"
            size="default"
            variant="default"
            title={isMobile ? undefined : t("common.add")}
            url="/invoices/create"
        />
    );

    return (
        <div className="space-y-4">
            <InvoiceReports reports={reports} isLoading={isLoading} />

            <DataTable
                data={invoices}
                setFilter={setFilter}
                columns={columns}
                toolbarOptions={toolbarOptions}
                toggleColumns={true}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
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
