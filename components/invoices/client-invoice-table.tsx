"use client";

import { DataTable } from "@/components/data-table/data-table";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { clientInvoiceColumns } from "./client-invoice-columns";
import { InvoiceRow } from "./invoice-type";

interface Props {
    clientId: string;
}

const ClientInvoiceTable: FC<Props> = ({ clientId }) => {
    const { t } = useTranslation();

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<InvoiceRow>>({
            queryKey: ["invoices", "client", clientId],
            url: "invoices",
            params: { client_id: clientId },
        });

    const invoices = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("invoice.client_invoices")} (${pagination.total})`
        : t("invoice.client_invoices");

    const BackButton = () => (
        <Button variant="outline" size="icon" asChild>
            <Link href="/clients">
                <ArrowLeft className="h-4 w-4" />
            </Link>
        </Button>
    );

    return (
        <DataTable
            data={invoices}
            columns={clientInvoiceColumns}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="invoices"
            form={BackButton}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default ClientInvoiceTable;
