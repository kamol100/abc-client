import { Metadata } from "next";
import ExpenseTable from "@/components/expenses/expense-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.expenses.title"),
};

export default function ExpenseReportsPage() {
    return (
        <ExpenseTable
            toolbarTitleKey="menu.reports.expenses.title"
            showCreateAction={false}
        />
    );
}
