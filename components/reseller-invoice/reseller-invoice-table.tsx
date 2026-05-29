"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import InvoiceFilterSchema from "@/components/invoices/invoice-filter-schema";
import InvoiceReports from "@/components/invoices/invoice-reports";
import { useResellerInvoiceColumns } from "@/components/reseller-invoice/reseller-invoice-column";
import type { ResellerInvoiceListApiResponse } from "@/components/reseller-invoice/reseller-invoice-type";

const ResellerInvoiceTable: FC = () => {
    const { t } = useTranslation();
    const columns = useResellerInvoiceColumns();
    const [filter, setFilter] = useState<string | null>(null);

    const params = useMemo(() => {
        if (!filter) return undefined;
        const queryParams = Object.fromEntries(
            new URLSearchParams(filter),
        ) as Record<string, string>;

        if (queryParams.track_id && !queryParams.trackID) {
            queryParams.trackID = queryParams.track_id;
        }

        return queryParams;
    }, [filter]);

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<ResellerInvoiceListApiResponse>({
            queryKey: ["reseller-invoice"],
            url: "reseller-invoice",
            params,
        });

    const invoices = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const reports = data?.data?.reports;

    const toolbarOptions = useMemo(() => ({ filter: InvoiceFilterSchema() }), []);

    const toolbarTitle = pagination?.total
        ? `${t("reseller_invoice.title_plural")} (${pagination.total})`
        : t("reseller_invoice.title_plural");

    return (
        <div className="space-y-4">
            <InvoiceReports reports={reports} isLoading={isLoading} />

            <DataTable
                data={invoices}
                setFilter={setFilter}
                columns={columns}
                toolbarOptions={toolbarOptions}
                toggleColumns={true}
                toolbar={true}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading || isFetching}
                isFetching={isFetching}
                queryKey="reseller-invoice"
                toolbarTitle={toolbarTitle}
            />
        </div>
    );
};

export default ResellerInvoiceTable;
