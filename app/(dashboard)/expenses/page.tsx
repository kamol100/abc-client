import ExpenseTable from "@/components/expenses/expense-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function Expenses() {
    return <ExpenseTable />;
}

export const metadata: Metadata = {
    title: t("expense.title_plural"),
    description: "Expenses",
};
