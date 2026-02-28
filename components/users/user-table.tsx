"use client";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { FC, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { UserRow } from "@/components/users/user-type";
import UserFilterSchema from "@/components/users/user-filter-schema";
import UserForm from "@/components/users/user-form";
import { UsersColumns } from "@/components/users/users-column";

const UserTable: FC = () => {
  const [filterValue, setFilter] = useState<string | null>(null);
  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<UserRow>>({
      queryKey: ["users"],
      url: "users",
      params,
    });

  const users = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const toolbarOptions = {
    filter: [...UserFilterSchema()],
  };

  const toolbarTitle = pagination?.total
    ? `Users (${pagination.total})`
    : "Users";

  return (
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
      toolbarTitle={toolbarTitle}
    />
  );
};

export default UserTable;
