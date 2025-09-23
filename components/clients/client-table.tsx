"use client";
import { useSetting } from "@/lib/utils/user-setting";
import Link from "next/link";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "../data-table/data-table";
import useListData from "../get-data/list-data";
import { SettingSchema } from "../settings/setting-zod-schema";
import { Button } from "../ui/button";
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
  const setting = useSetting("settings") as SettingSchema;

  const toolbarOptions = {
    // input_filter: "name",
    // columns: ["status", "email"],
    filter: ClientFilterSchema(),
  };

  return (
    <>
      {setting?.show_table_header && (
        <div className="flex justify-between mb-5">
          <h1>Clients</h1>
          <div>
            <Link href={"/clients/create"}>
              <Button>Add</Button>
            </Link>
          </div>
        </div>
      )}

      <div>
        {users && (
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
          />
        )}
      </div>
    </>
  );
};

export default ClientTable;
