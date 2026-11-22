"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { ExpenseTypeColumns } from "./expense-type-column";
import ExpenseTypeForm from "./expense-type-form";
import { ExpenseTypeRow } from "./expense-type-type";
import { useTranslation } from "react-i18next";

const ExpenseTypeTable: FC = () => {
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
        useApiQuery<PaginatedApiResponse<ExpenseTypeRow>>({
            queryKey: ["expense-types"],
            url: "expense-types",
            params,
        });

    const expenseTypes = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("expense_type.title_plural")} (${pagination.total})`
        : t("expense_type.title_plural");

    const toolbar: DataTableToolbarConfig = {
        title: toolbarTitle,
        features: {
            columns: true,
            add: ExpenseTypeForm,
        },
    };

    return (
        <DataTable
            data={expenseTypes}
            setFilter={setFilter}
            columns={ExpenseTypeColumns}
            toolbar={toolbar}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
        />
    );
};

export default ExpenseTypeTable;
