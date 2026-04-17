"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { TicketRow } from "@/components/tickets/ticket-type";
import { useClientTicketColumns } from "./client-ticket-columns";
import ClientTicketFilterSchema from "./client-ticket-filter-schema";
import ClientTicketForm from "./client-ticket-form";

const ClientTicketsTable: FC = () => {
  const { t } = useTranslation();
  const columns = useClientTicketColumns();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(() => {
    if (!filterValue) return undefined;
    return Object.fromEntries(
      new URLSearchParams(filterValue),
    ) as Record<string, string>;
  }, [filterValue]);

  const toolbarOptions = useMemo(
    () => ({ filter: ClientTicketFilterSchema() }),
    [],
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<TicketRow>>({
      queryKey: ["client-tickets"],
      url: "client-tickets",
      params,
    });

  const tickets = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const toolbarTitle = pagination?.total
    ? `${t("ticket.title_plural")} (${pagination.total})`
    : t("ticket.title_plural");

  return (
    <DataTable
      data={tickets}
      columns={columns}
      toolbarOptions={toolbarOptions}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading || isFetching}
      isFetching={isFetching}
      setFilter={setFilter}
      form={ClientTicketForm}
      queryKey="client-tickets"
      toolbarTitle={toolbarTitle}
    />
  );
};

export default ClientTicketsTable;
