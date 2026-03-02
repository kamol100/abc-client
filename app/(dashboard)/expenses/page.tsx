import ExpenseTable from "@/components/expenses/expense-table";
import i18n from "i18next";
import { Metadata } from "next";

export default async function Expenses() {
    return <ExpenseTable />;
}

export const metadata: Metadata = {
    title: i18n.t("expense.title_plural"),
    description: "Expenses",
};
