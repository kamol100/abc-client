"use client";

import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { useSidebar } from "@/components/ui/sidebar";
import { StaffColumns } from "./staff-column";
import { StaffRow } from "./staff-type";
import MyButton from "../my-button";

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
    ? `${t("staff.title")} (${pagination.total})`
    : t("staff.title");

  const FormLink = () => (
    <Link href="/staffs/create">
      <MyButton size={"default"} variant={"default"}>
        {isMobile ? <Plus /> : <><Plus /> {t("common.add")}</>}
      </MyButton>
    </Link>
  );

  const toolbar: DataTableToolbarConfig = {
    title: toolbarTitle,
    features: {
      columns: true,
      add: FormLink,
    },
  };

  return (
    <DataTable
      data={staffs}
      setFilter={setFilter}
      columns={StaffColumns}
      toolbar={toolbar}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      queryKey="staffs"
    />
  );
};

export default StaffTable;
