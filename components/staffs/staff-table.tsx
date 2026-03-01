"use client";

import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { useSidebar } from "@/components/ui/sidebar";
import { StaffColumns } from "./staff-column";
import { StaffRow } from "./staff-type";
import ActionButton from "../action-button";

const StaffTable: FC = () => {
  const [filterValue, setFilter] = useState<string | null>(null);
  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<StaffRow>>({
      queryKey: ["staffs"],
      url: "staffs",
      params,
    });

  const staffs = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const { t } = useTranslation();
  const { isMobile } = useSidebar();

  const toolbarTitle = pagination?.total
    ? `${t("staffs")} (${pagination.total})`
    : t("staffs");

  const FormLink = () => (
    <Link href="/staffs/create">
      <ActionButton>
        {isMobile ? <Plus /> : <><Plus /> {t("add")}</>}
      </ActionButton>
    </Link>
  );

  return (
    <DataTable
      data={staffs}
      setFilter={setFilter}
      columns={StaffColumns}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      queryKey="staffs"
      form={FormLink}
      toolbarTitle={toolbarTitle}
    />
  );
};

export default StaffTable;
