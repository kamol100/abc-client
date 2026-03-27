"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { UserRow } from "@/components/users/user-type";
import UserFilterSchema from "@/components/users/user-filter-schema";
import UserForm from "@/components/users/user-form";
import { UsersColumns } from "@/components/users/users-column";

const UserTable: FC = () => {
  const { t } = useTranslation();
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
    ? `${t("user.title_plural")} (${pagination.total})`
    : t("user.title_plural");

  return (
    <DataTable
      data={users}
      setFilter={setFilter}
      columns={UsersColumns}
      toolbarOptions={toolbarOptions}
      toggleColumns={true}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading || isFetching}
      isFetching={isFetching}
      form={UserForm}
      toolbarTitle={toolbarTitle}
    />
  );
};

export default UserTable;
