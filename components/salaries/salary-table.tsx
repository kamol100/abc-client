"use client";

import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { useSidebar } from "@/components/ui/sidebar";
import MyButton from "../my-button";
import { SalaryColumns } from "./salary-column";
import { SalaryRow } from "./salary-type";

const SalaryTable: FC = () => {
  const [filterValue, setFilter] = useState<string | null>(null);
  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue],
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<SalaryRow>>({
      queryKey: ["salaries"],
      url: "salaries",
      params,
    });

  const salaries = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const { t } = useTranslation();
  const { isMobile } = useSidebar();

  const toolbarTitle = pagination?.total
    ? `${t("salary.title")} (${pagination.total})`
    : t("salary.title");

  const FormLink = () => (
    <Link href="/salaries/create">
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
      data={salaries}
      setFilter={setFilter}
      columns={SalaryColumns}
      toolbar={toolbar}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      queryKey="salaries"
    />
  );
};

export default SalaryTable;
