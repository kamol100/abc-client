"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { useToolbarFit } from "@/components/data-table/toolbar/use-toolbar-fit";
import MyButton from "@/components/my-button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePermissions } from "@/context/app-provider";
import { useInvoiceColumns } from "./invoice-column";
import InvoiceFilterSchema from "./invoice-filter-schema";
import InvoiceReports, { type InvoiceReportsDensity } from "./invoice-reports";
import { InvoiceListApiResponse } from "./invoice-type";

// Toolbar fit level 0 and 1 show the totals in full; each level after that is one step narrower.
const REPORT_DENSITIES: InvoiceReportsDensity[] = ["full", "compact", "tight"];

type InvoiceTableProps = {
    toolbarTitleKey?: string;
    showCreateAction?: boolean;
    filterValue?: string;
    tableToolBar?: boolean;
    reportsToolbar?: boolean;
    /** Client view: the client's wallet balance, shown as an "Advance Payment" chip with the totals. */
    advancePayment?: number | string | null;
};

const InvoiceTable: FC<InvoiceTableProps> = ({
    toolbarTitleKey = "invoice.title_plural",
    showCreateAction = true,
    filterValue = null,
    tableToolBar = true,
    reportsToolbar = true,
    advancePayment,
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

    // The toolbar is one row. When it does not fit, it gives up room in this order:
    // the title becomes a count chip, the totals lose their icons, then their padding.
    // Only when that is still too wide do the totals fall back to the two-column grid.
    const fitKey = `${isLoading}|${pagination?.total}|${reports?.total_amount}|${reports?.discount}|${reports?.after_discount_amount}|${reports?.amount_paid}|${t(toolbarTitleKey)}`;
    const { level: fitLevel, anchorRef: titleRef } = useToolbarFit(REPORT_DENSITIES.length + 1, fitKey);
    const reportsDensity: InvoiceReportsDensity = isMobile
        ? "grid"
        : REPORT_DENSITIES[Math.max(0, fitLevel - 1)] ?? "grid";
    const countOnly = fitLevel >= 1 && Boolean(pagination?.total);
    const titleText = pagination?.total
        ? `${t(toolbarTitleKey)} (${pagination.total})`
        : t(toolbarTitleKey);
    const toolbarTitle = (
        <span ref={titleRef} className="flex min-h-9 items-center whitespace-nowrap">
            {countOnly ? (
                // Count chip: the label gives its room to the totals. It stays for screen readers and on hover.
                <span
                    title={titleText}
                    className="flex h-9 min-w-9 items-center justify-center rounded-[var(--radius)] border border-border bg-background px-2.5 text-sm font-semibold tabular-nums"
                >
                    <span className="sr-only">{t(toolbarTitleKey)} </span>
                    {pagination?.total}
                </span>
            ) : (
                titleText
            )}
        </span>
    );

    const CreateButton = () => (
        <MyButton
            action="add"
            size="default"
            variant="default"
            title={isMobile ? undefined : t("common.add")}
            url="/invoices/create"
        />
    );


    const toolbar: DataTableToolbarConfig | false = tableToolBar ? {
        title: toolbarTitle,
        center: reportsToolbar
            ? [{ key: "totals", node: <InvoiceReports reports={reports} isLoading={isLoading} layout="toolbar" density={reportsDensity} /> }]
            : undefined,
        page: "invoices",
        features: {
            columns: true,
            filter: toolbarOptions,
            add: hasPermission("invoices.create") && showCreateAction
                ? CreateButton
                : undefined,
        },
    } : false;

    return (
        <div className="space-y-4">
            {/* Without the toolbar (client view), the totals sit above the table. */}
            {reportsToolbar && !tableToolBar && (
                <InvoiceReports reports={reports} isLoading={isLoading} advancePayment={advancePayment} />
            )}

            <DataTable
                data={invoices}
                setFilter={setFilter}
                columns={columns}
                toolbar={toolbar}
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
