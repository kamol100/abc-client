"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { keepPreviousData } from "@tanstack/react-query";
import { CircleAlert, CircleCheck } from "lucide-react";
import Card from "@/components/card";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FormFilter from "@/components/form-wrapper/form-filter";
import useApiQuery from "@/hooks/use-api-query";
import { formatMoney } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import IncomeExpenseFilterSchema from "@/components/reports/income-expense-filter-schema";
import IncomeExpenseSummary, { type IncomeExpenseEntry } from "@/components/reports/income-expense-summary";
import {
    IncomeStatementApiResponse,
    IncomeStatementLine,
    incomeStatementParams,
    parseIncomeStatement,
} from "@/components/reports/income-expense-type";

const toEntries = (lines: IncomeStatementLine[] | undefined): IncomeExpenseEntry[] =>
    (lines ?? []).map((line) => ({ key: line.key, name: line.name, amount: line.amount }));

const IncomeExpenseTable = () => {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(() => incomeStatementParams(filterValue), [filterValue]);

    // One statement from the API: income is money received, expenses are money
    // paid out, both checked against the fund deposits.
    const query = useApiQuery<IncomeStatementApiResponse>({
        queryKey: ["income-expense", "statement"],
        url: "reports/income-statement",
        params,
        pagination: false,
        placeholderData: keepPreviousData,
    });

    const statement = parseIncomeStatement(query.data?.data);
    const isLoading = query.isLoading;
    const incomeTotal = statement?.income.total ?? 0;
    const expenseTotal = statement?.expenses.total ?? 0;
    const net = statement?.net ?? 0;
    const checks = statement?.checks;
    const problems = checks
        ? [
              { key: "missing_fund_deposit", ...checks.missing_fund_deposit },
              { key: "amount_mismatch", ...checks.amount_mismatch },
              { key: "date_mismatch", ...checks.date_mismatch },
          ].filter((problem) => problem.count > 0)
        : [];

    const totals = [
        { key: "total_income", value: incomeTotal },
        { key: "total_expense", value: expenseTotal },
        { key: "net_balance", value: net },
    ];

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

            {query.error && (
                <Card>
                    <CardContent className="p-4 text-sm text-destructive">
                        {t("common.failed_to_load_data")}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {totals.map((item) => (
                    <Card key={item.key}>
                        <CardContent className="p-4 space-y-1">
                            <p className="text-xs text-muted-foreground">
                                {t(`income_expense.summary.${item.key}`)}
                            </p>
                            {isLoading ? (
                                <Skeleton className="h-7 w-32" />
                            ) : (
                                <p
                                    className={cn(
                                        "h-7 text-xl font-semibold text-primary",
                                        item.key === "net_balance" && item.value < 0 && "text-destructive",
                                    )}
                                >
                                    ৳{formatMoney(item.value)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Fixed height in every state, so the sections below do not move. */}
            <Card>
                <CardContent className="flex min-h-14 flex-col justify-center gap-1 p-4 text-sm">
                    {isLoading || !checks ? (
                        <Skeleton className="h-4 w-2/3" />
                    ) : problems.length === 0 ? (
                        <p className="flex items-center gap-2 text-muted-foreground">
                            <CircleCheck className="size-4 shrink-0 text-primary" aria-hidden />
                            {t("income_expense.checks.ok", { amount: formatMoney(checks.fund_deposits) })}
                        </p>
                    ) : (
                        problems.map((problem) => (
                            <p key={problem.key} className="flex items-center gap-2 text-destructive">
                                <CircleAlert className="size-4 shrink-0" aria-hidden />
                                {t(`income_expense.checks.${problem.key}`, {
                                    count: problem.count,
                                    amount: formatMoney(problem.amount),
                                })}
                            </p>
                        ))
                    )}
                    {statement && statement.paid_from_wallet > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {t("income_expense.checks.paid_from_wallet", {
                                amount: formatMoney(statement.paid_from_wallet),
                            })}
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <IncomeExpenseSummary
                    titleKey="income_expense.sections.income_type"
                    entries={toEntries(statement?.income.lines)}
                    total={incomeTotal}
                    isLoading={isLoading}
                />
                <IncomeExpenseSummary
                    titleKey="income_expense.sections.expense_type"
                    entries={toEntries(statement?.expenses.lines)}
                    total={expenseTotal}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default IncomeExpenseTable;
