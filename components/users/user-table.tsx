"use client";
import { FC } from "react";
import { DataTable } from "../data-table/data-table";
import useListData from "../get-data/list-data";
import UserForm from "./user-form";
import { UsersColumns } from "./users-column";

const UserTable: FC = () => {
  const { data, isLoading, isFetching, setCurrentPage, currentPage } =
    useListData({
      api: "users",
      queryKey: "users",
    });
  // const {
  //   data: { data: users, pagination },
  // } = data;
  const users = data?.data?.data;
  const pagination = data?.data?.pagination;

  const toolbarOptions = {
    input_filter: "name",
    columns: ["status", "email"],
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
            columns={UsersColumns}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        )}
      </div>
    </>
  );
};

export default UserTable;
