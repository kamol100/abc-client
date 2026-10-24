"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import ExpenseFilterSchema from "@/components/expenses/expense-filter-schema";
import ExpenseForm from "@/components/expenses/expense-form";
import { ExpenseColumns } from "@/components/expenses/expense-column";
import ExpenseReports from "@/components/expenses/expense-reports";
import { ExpenseListApiResponse } from "@/components/expenses/expense-type";
import useApiQuery from "@/hooks/use-api-query";

type ExpenseTableProps = {
    toolbarTitleKey?: string;
    showCreateAction?: boolean;
};

const ExpenseTable: FC<ExpenseTableProps> = ({
    toolbarTitleKey = "expense.title_plural",
    showCreateAction = true,
}) => {
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue],
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<ExpenseListApiResponse>({
            queryKey: ["expenses"],
            url: "expenses",
            params,
        });

    const expenses = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const reports = data?.data?.reports;
    const { t } = useTranslation();

    const toolbarOptions = {
        filter: ExpenseFilterSchema(),
        filter_row: 2,
    };

    const toolbarTitle = pagination?.total
        ? `${t(toolbarTitleKey)} (${pagination.total})`
        : t(toolbarTitleKey);

    return (
        <div className="space-y-4 pl-0.5">
            <ExpenseReports reports={reports} isLoading={isLoading} />
            <DataTable
                data={expenses}
                setFilter={setFilter}
                columns={ExpenseColumns}
                toolbarOptions={toolbarOptions}
                toggleColumns
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading || isFetching}
                isFetching={isFetching}
                form={showCreateAction ? ExpenseForm : undefined}
                toolbarTitle={toolbarTitle}
                queryKey="expenses"
            />
        </div>
    );
};

export default ExpenseTable;
