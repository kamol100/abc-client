"use client";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "../data-table/data-table";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { ClientColumns } from "./client-column";
import ClientFilterSchema from "./client-filter-schema";

type ClientRow = Record<string, unknown>;

const ClientTable: FC = () => {
  const [filterValue, setFilter] = useState<string | null>(null);
  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<ClientRow>>({
      queryKey: ["clients"],
      url: "clients",
      params,
    });

  const clients = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const { t } = useTranslation();
  const { isMobile } = useSidebar();

  const toolbarOptions = {
    filter: ClientFilterSchema(),
  };

  const FormLink = () => (
    <Link href={"/clients/create"}>
      <Button>
        {isMobile ? (
          <Plus />
        ) : (
          <>
            <Plus /> Add
          </>
        )}
      </Button>
    </Link>
  );

  const toolbarTitle = pagination?.total
    ? `Clients (${pagination.total})`
    : "Clients";

  return (
    <div>
      <DataTable
        data={clients}
        setFilter={setFilter}
        columns={ClientColumns}
        toolbarOptions={toolbarOptions}
        toggleColumns={true}
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        isFetching={isFetching}
        queryKey={"clients"}
        form={FormLink}
        toolbarTitle={toolbarTitle}
      />
    </div>
  );
};

export default ClientTable;
