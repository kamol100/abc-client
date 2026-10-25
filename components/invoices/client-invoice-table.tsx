"use client";

import { ArrowLeft } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import ClientInvoiceFilterSchema from "@/components/invoices/client-invoice-filter-schema";
import { clientInvoiceColumns } from "@/components/invoices/client-invoice-columns";
import { clientInvoiceQueryParams } from "@/components/invoices/client-invoice-params";
import InvoiceReports from "@/components/invoices/invoice-reports";
import { InvoiceListApiResponse } from "@/components/invoices/invoice-type";
import MyButton from "@/components/my-button";
import useApiQuery from "@/hooks/use-api-query";

interface Props {
    clientId: string;
}

const ClientInvoiceTable: FC<Props> = ({ clientId }) => {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () => clientInvoiceQueryParams(clientId, filterValue),
        [clientId, filterValue],
    );

    const toolbarOptions = useMemo(
        () => ({
            filter: ClientInvoiceFilterSchema(),
        }),
        [],
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<InvoiceListApiResponse>({
            queryKey: ["invoices", "client", clientId],
            url: "invoices",
            params,
        });

    const invoices = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const reports = data?.data?.reports;

    const toolbarTitle = pagination?.total
        ? `${t("invoice.client_history.title")} (${pagination.total})`
        : t("invoice.client_history.title");

    const BackButton = () => (
        <MyButton
            action="cancel"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            url="/clients"
            aria-label={t("invoice.client_history.title")}
        >
            <ArrowLeft className="h-4 w-4" />
        </MyButton>
    );

    return (
        <div className="space-y-4">
            {(isLoading || reports) && (
                <InvoiceReports reports={reports} isLoading={isLoading} />
            )}
            <DataTable
                data={invoices}
                columns={clientInvoiceColumns}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                setFilter={(value) => setFilter(value)}
                toolbarOptions={toolbarOptions}
                queryKey="invoices"
                form={BackButton}
                toolbarTitle={toolbarTitle}
            />
        </div>
    );
};

export default ClientInvoiceTable;
