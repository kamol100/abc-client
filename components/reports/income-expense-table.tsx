"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { CardContent } from "@/components/ui/card";
import FormFilter from "@/components/form-wrapper/form-filter";
import useApiQuery from "@/hooks/use-api-query";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import IncomeExpenseFilterSchema from "@/components/reports/income-expense-filter-schema";
import IncomeExpenseSummary from "@/components/reports/income-expense-summary";
import {
    IncomeExpenseApiResponse,
    normalizeIncomeExpenseRow,
} from "@/components/reports/income-expense-type";

function pickEntries(data: Record<string, unknown>): Array<[string, number]> {
    return Object.entries(data)
        .filter(([key]) => key !== "total")
        .map(([key, value]) => [key, toNumber(value as number | string | null | undefined)]);
}

const IncomeExpenseTable = () => {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);

    const params = useMemo(() => {
        if (!filterValue) return undefined;
        return Object.fromEntries(new URLSearchParams(filterValue)) as Record<string, string>;
    }, [filterValue]);

    const incomeQuery = useApiQuery<IncomeExpenseApiResponse>({
        queryKey: ["income-expense", "income-type"],
        url: "invoice-type",
        params,
        pagination: false,
    });

    const expenseQuery = useApiQuery<IncomeExpenseApiResponse>({
        queryKey: ["income-expense", "expense-type"],
        url: "expense-type",
        params,
        pagination: false,
    });

    const income = normalizeIncomeExpenseRow(incomeQuery.data?.data);
    const expense = normalizeIncomeExpenseRow(expenseQuery.data?.data);
    const incomeEntries = pickEntries(income as Record<string, unknown>);
    const expenseEntries = pickEntries(expense as Record<string, unknown>);
    const incomeTotal = toNumber(income.total);
    const expenseTotal = toNumber(expense.total);
    const netBalance = incomeTotal - expenseTotal;

    const hasError = Boolean(incomeQuery.error || expenseQuery.error);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <FormFilter
                    formSchema={IncomeExpenseFilterSchema()}
                    grids={1}
                    setFilter={setFilter}
                    className="h-auto"
                />
            </div>

            {hasError && (
                <Card>
                    <CardContent className="p-4 text-sm text-destructive">
                        {t("common.failed_to_load_data")}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Card>
                    <CardContent className="p-4 space-y-1">
                        <p className="text-xs text-muted-foreground">
                            {t("income_expense.summary.total_income")}
                        </p>
                        <p className="text-xl font-semibold text-primary">
                            ৳{formatMoney(incomeTotal)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 space-y-1">
                        <p className="text-xs text-muted-foreground">
                            {t("income_expense.summary.total_expense")}
                        </p>
                        <p className="text-xl font-semibold text-primary">
                            ৳{formatMoney(expenseTotal)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 space-y-1">
                        <p className="text-xs text-muted-foreground">
                            {t("income_expense.summary.net_balance")}
                        </p>
                        <p className="text-xl font-semibold text-primary">
                            ৳{formatMoney(netBalance)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <IncomeExpenseSummary
                    titleKey="income_expense.sections.income_type"
                    entries={incomeEntries}
                    total={incomeTotal}
                    isLoading={incomeQuery.isLoading || incomeQuery.isFetching}
                />
                <IncomeExpenseSummary
                    titleKey="income_expense.sections.expense_type"
                    entries={expenseEntries}
                    total={expenseTotal}
                    isLoading={expenseQuery.isLoading || expenseQuery.isFetching}
                />
            </div>
        </div>
    );
};

export default IncomeExpenseTable;
