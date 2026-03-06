"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { usePermissions } from "@/context/app-provider";
import { useInvoiceTypeColumns } from "@/components/invoice-type/invoice-type-column";
import InvoiceTypeForm from "@/components/invoice-type/invoice-type-form";
import { InvoiceTypeRow } from "@/components/invoice-type/invoice-type-type";

const InvoiceTypeTable: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const columns = useInvoiceTypeColumns();

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<InvoiceTypeRow>>({
            queryKey: ["invoice-types"],
            url: "invoice-types",
        });

    const invoiceTypes = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("invoice_type.title_plural")} (${pagination.total})`
        : t("invoice_type.title_plural");

    return (
        <DataTable
            data={invoiceTypes}
            columns={columns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="invoice-types"
            form={hasPermission("invoice-types.create") ? InvoiceTypeForm : undefined}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default InvoiceTypeTable;
