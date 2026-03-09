import { Metadata } from "next";
import IncomeExpenseTable from "@/components/reports/income-expense-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.income_expense.title"),
};

export default function IncomeExpenseReportsPage() {
    return <IncomeExpenseTable />;
}
