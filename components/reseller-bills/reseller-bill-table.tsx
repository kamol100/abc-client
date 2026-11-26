"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import InvoiceReports from "@/components/invoices/invoice-reports";
import type { InvoiceReports as InvoiceReportsType } from "@/components/invoices/invoice-type";
import { resellerBillColumns } from "@/components/reseller-bills/reseller-bill-columns";
import type { ResellerBillRow } from "@/components/reseller-bills/reseller-bill-type";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";

type ResellerBillListResponse = ApiResponse<{
    data: ResellerBillRow[];
    pagination: Pagination;
    reports?: InvoiceReportsType | null;
}>;

/** "My bills": the invoices the company (or parent reseller) billed to the signed-in reseller. */
const ResellerBillTable: FC = () => {
    const { t } = useTranslation();
    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<ResellerBillListResponse>({
        queryKey: ["reseller-invoices"],
        url: "reseller-invoices",
    });

    const bills = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const reports = data?.data?.reports;

    const toolbar: DataTableToolbarConfig = {
        title: pagination?.total
            ? `${t("reseller_bill.title")} (${pagination.total})`
            : t("reseller_bill.title"),
    };

    return (
        <div className="space-y-4">
            {(isLoading || reports) && <InvoiceReports reports={reports} isLoading={isLoading} />}
            <DataTable
                data={bills}
                columns={resellerBillColumns}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                toolbar={toolbar}
                queryKey="reseller-invoices"
            />
        </div>
    );
};

export default ResellerBillTable;
