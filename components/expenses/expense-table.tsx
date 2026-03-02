"use client";

import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { ExpenseColumns } from "./expense-column";
import ExpenseForm from "./expense-form";
import { ExpenseRow } from "./expense-type";
import ExpenseFilterSchema from "./expense-filter-schema";

const ExpenseTable: FC = () => {
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue],
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ExpenseRow>>({
            queryKey: ["expenses"],
            url: "expenses",
            params,
        });

    const expenses = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const { t } = useTranslation();

    const toolbarOptions = {
        filter: ExpenseFilterSchema(),
    };

    const toolbarTitle = pagination?.total
        ? `${t("expense.title_plural")} (${pagination.total})`
        : t("expense.title_plural");

    return (
        <DataTable
            data={expenses}
            setFilter={setFilter}
            columns={ExpenseColumns}
            toolbarOptions={toolbarOptions}
            toggleColumns
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={ExpenseForm}
            toolbarTitle={toolbarTitle}
            queryKey="expenses"
        />
    );
};

export default ExpenseTable;
