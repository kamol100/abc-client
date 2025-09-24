"use client";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "../data-table/data-table";
import useListData from "../get-data/list-data";
import UserFilterSchema from "./user-filter-schema";
import UserForm from "./user-form";
import { UsersColumns } from "./users-column";

const UserTable: FC = () => {
  const [filterValue, setFilter] = useState<string | null>(null);
  const { data, isLoading, isFetching, setCurrentPage, currentPage } =
    useListData({
      api: "users",
      queryKey: "users",
      filterValue: filterValue,
    });

  const users = data?.data?.data;
  const pagination = data?.data?.pagination;
  const { t } = useTranslation();

  const toolbarOptions = {
    input_filter: "name",
    columns: ["status", "email"],
    filter: [...UserFilterSchema()],
  };

  return (
    <>
      <div className="flex justify-between mb-5">
        <h1>Users</h1>
        <div>
          <UserForm />
        </div>
      </div>
      <div>
        {users && (
          <DataTable
            data={users}
            setFilter={setFilter}
            columns={UsersColumns}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={UserForm}
          />
        )}
      </div>
    </>
  );
};

export default UserTable;
