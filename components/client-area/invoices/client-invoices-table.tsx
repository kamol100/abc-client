"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import InvoiceReports from "@/components/invoices/invoice-reports";
import { InvoiceListApiResponse } from "@/components/invoices/invoice-type";
import { useClientInvoiceColumns } from "@/components/client-area/invoices/client-invoice-columns";
import ClientInvoiceFilterSchema from "@/components/client-area/invoices/client-invoice-filter-schema";

const ClientInvoicesTable: FC = () => {
  const { t } = useTranslation();
  const columns = useClientInvoiceColumns();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(() => {
    if (!filterValue) return undefined;
    return Object.fromEntries(
      new URLSearchParams(filterValue),
    ) as Record<string, string>;
  }, [filterValue]);

  const toolbarOptions = useMemo(
    () => ({ filter: ClientInvoiceFilterSchema() }),
    [],
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<InvoiceListApiResponse>({
      queryKey: ["client-invoices"],
      url: "client-invoices",
      params,
    });

  const invoices = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const reports = data?.data?.reports;

  const toolbarTitle = pagination?.total
    ? `${t("invoice.title_plural")} (${pagination.total})`
    : t("invoice.title_plural");

  return (
    <div className="space-y-4">
      <InvoiceReports reports={reports} isLoading={isLoading} />
      <DataTable
        data={invoices}
        columns={columns}
        toolbarOptions={toolbarOptions}
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading || isFetching}
        isFetching={isFetching}
        setFilter={setFilter}
        queryKey="client-invoices"
        toolbarTitle={toolbarTitle}
      />
    </div>
  );
};

export default ClientInvoicesTable;
