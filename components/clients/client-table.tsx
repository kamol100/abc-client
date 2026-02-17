"use client";
import { useSettings } from "@/context/app-provider";
import { Plus } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "../data-table/data-table";
import useListData from "../get-data/list-data";
import { SettingSchema } from "../settings/setting-zod-schema";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { ClientColumns } from "./client-column";
import ClientFilterSchema from "./client-filter-schema";

const ClientTable: FC = () => {
  const [filterValue, setFilter] = useState<string | null>(null);
  const { data, isLoading, isFetching, setCurrentPage, currentPage } =
    useListData({
      api: "clients",
      queryKey: "clients",
      filterValue: filterValue,
    });

  const users = data?.data?.data;
  const pagination = data?.data?.pagination;
  const { t } = useTranslation();
  const { settings: setting } = useSettings();
  const { isMobile } = useSidebar();

  const toolbarOptions = {
    // input_filter: "name",
    // columns: ["status", "email"],
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

  const toolbarTitle = () => {
    if (data?.data?.pagination?.total) {
      return `Clients (${data?.data?.pagination?.total})`;
    }
    return `Clients`;
  };

  return (
    <>
      <div>
        <DataTable
          data={users}
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
          toolbarTitle={toolbarTitle()}
        />
      </div>
    </>
  );
};

export default ClientTable;
