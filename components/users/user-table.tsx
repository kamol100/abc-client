"use client";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "../data-table/data-table";
import { UserRow } from "./user-type";
import UserFilterSchema from "./user-filter-schema";
import UserForm from "./user-form";
import { UsersColumns } from "./users-column";

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
  const { t } = useTranslation();

  const toolbarOptions = {
    filter: [...UserFilterSchema()],
  };

  const toolbarTitle = pagination?.total
    ? `Users (${pagination.total})`
    : "Users";

  return (
    <div>
      {users.length > 0 && (
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
      )}
    </div>
  );
};

export default UserTable;
