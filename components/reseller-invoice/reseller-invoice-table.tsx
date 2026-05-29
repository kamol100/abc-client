"use client";

import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { useResellerInvoiceColumns } from "@/components/reseller-invoice/reseller-invoice-column";
import type { ResellerInvoiceDueApiResponse } from "@/components/reseller-invoice/reseller-invoice-type";

const ResellerInvoiceTable: FC = () => {
    const { t } = useTranslation();
    const columns = useResellerInvoiceColumns();

    const { data, isLoading, isFetching } = useApiQuery<ResellerInvoiceDueApiResponse>({
        queryKey: ["reseller-invoice"],
        url: "reseller-invoice",
        pagination: false,
    });

    const invoices = data?.data?.invoiceDue ?? [];

    const toolbarTitle = useMemo(() => {
        const title = t("reseller_invoice.title_plural");
        return invoices.length > 0 ? `${title} (${invoices.length})` : title;
    }, [invoices.length, t]);

    return (
        <div className="space-y-4">
            <DataTable
                data={invoices}
                columns={columns}
                toggleColumns={true}
                toolbar={true}
                pagination={undefined}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="reseller-invoice"
                toolbarTitle={toolbarTitle}
            />
        </div>
    );
};

export default ResellerInvoiceTable;
